# Codify — Phase 1 MVP Stack & Architecture

**Locked stack (Feb 2025)**

| Layer         | Choice                 | Notes                                                        |
| ------------- | ---------------------- | ------------------------------------------------------------ |
| Frontend      | **Next.js**            | App router, API routes for BFF if needed                     |
| Backend API   | **FastAPI** (Python)   | RAG, orchestrator, CRUD; separate service                    |
| Database      | **PostgreSQL**         | intake_profiles, plans, problems, community (no users table) |
| Vector store  | **pgvector**           | User profile embeddings, same Postgres                       |
| LLM           | **OpenAI**             | Plan generation, hints; via orchestrator                     |
| Auth          | **Email + OAuth**      | Google + GitHub; NextAuth in Next.js                         |
| Auth strategy | **Option B: JWT-only** | No session DB; FastAPI trusts JWT, no `users` table          |

---

## 1. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js (Vercel or self-hosted)                                │
│  • Pages: onboarding, dashboard, plan, problem pages             │
│  • NextAuth: email + Google + GitHub                            │
│  • Calls FastAPI with session JWT or HTTP-only cookie            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FastAPI (Railway / Render / Fly / EC2)                          │
│  • Auth: validate JWT from Next.js                               │
│  • Intake CRUD, plan generation (orchestrator), problems,       │
│    upvotes, comments                                             │
│  • Embeddings (OpenAI) + pgvector for RAG                        │
│  • Single LLM call for plan; optional hint endpoint              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL + pgvector (Supabase / Neon / Railway / RDS)         │
│  • Relational tables: intake_profiles, plans, problems,          │
│    upvotes, comments (no users table — user_id from JWT only)    │
│  • Vector column: intake_profiles.embedding, optional            │
│    problem embeddings later                                      │
└─────────────────────────────────────────────────────────────────┘
```

- **Auth lives in Next.js** (NextAuth). FastAPI does **not** implement login; it only validates the token/session and uses `user_id` for all operations.
- **Orchestrator** = FastAPI service that: loads user intake (+ optional similar users via pgvector), loads curated knowledge, calls OpenAI once for the plan, optionally applies community weights, returns JSON plan.

---

## 2. Auth flow — Option B: JWT-only

**Choice:** NextAuth with **JWT session strategy** (no database adapter for sessions). FastAPI has **no `users` table**; it only trusts the JWT and uses `user_id` for all writes.

1. User signs in with **NextAuth** (email, Google, or GitHub).
2. Next.js uses **JWT strategy**: session is a signed JWT in a cookie (no session table in DB).
3. JWT payload must include **`user_id`** (and optionally `email`). Set in NextAuth `jwt()` callback (e.g. use NextAuth’s default user id or a UUID you generate on first sign-in).
4. Frontend calls FastAPI with **`Authorization: Bearer <JWT>`**. Next.js can read the session JWT and send it in the header, or you use a short-lived API token derived from the session—simplest is sending the same session JWT as Bearer.
5. FastAPI: one shared **`JWT_SECRET`** with NextAuth (same as `NEXTAUTH_SECRET`). Decode JWT → verify signature → read `user_id` → attach to request. All tables reference this `user_id` (TEXT/UUID); no user lookup.

**FastAPI auth:** Single dependency (e.g. `python-jose` or `PyJWT`). Dependency: `Authorization` header → decode with `JWT_SECRET` → return `user_id` or 401.

---

## 3. Data schema (PostgreSQL + pgvector)

### 3.1 Enable pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3.2 Tables (Option B: no `users` table)

**FastAPI does not have a `users` table.** Identity comes only from the JWT. All tables below use `user_id` (TEXT) as the user reference—same value NextAuth puts in the JWT.

---

**`intake_profiles`**

| Column               | Type         | Description                                              |
| -------------------- | ------------ | -------------------------------------------------------- |
| id                   | UUID         | PK                                                       |
| user_id              | TEXT         | From auth                                                |
| level                | TEXT         | beginner / intermediate / advanced                       |
| role_target          | TEXT[]       | e.g. SWE, ML, Backend                                    |
| timeline_weeks       | INT          |                                                          |
| hours_per_week       | INT          |                                                          |
| topic_confidence     | JSONB        | e.g. `{"arrays": 2, "graphs": 1}` (1–3 or 1–5)           |
| weaknesses           | TEXT[]       | conceptual, pattern_recognition, speed, communication    |
| constraints          | TEXT         | Optional free text                                       |
| past_experience      | TEXT         | e.g. LC count, prep history                              |
| regeneration_answers | JSONB        | Append-only: `[{"q": "What felt hardest?", "a": "..."}]` |
| embedding            | VECTOR(1536) | OpenAI text-embedding-3-small; null before first embed   |
| created_at           | TIMESTAMPTZ  |                                                          |
| updated_at           | TIMESTAMPTZ  |                                                          |

- One row per user (upsert on intake submit / regeneration).
- **RAG:** Embed concatenation of level, role_target, timeline_weeks, weaknesses, regeneration_answers (and any other text you want); store in `embedding`. Query: “similar profiles” via pgvector `ORDER BY embedding <=> $query_embedding LIMIT k`.

---

**`plans`**

| Column       | Type        | Description                                                                                            |
| ------------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| id           | UUID        | PK                                                                                                     |
| user_id      | TEXT        |                                                                                                        |
| generated_at | TIMESTAMPTZ |                                                                                                        |
| plan_json    | JSONB       | Full 2–4 week plan: `{ "weeks": [ { "days": [ { "topic", "problems", "difficulty", "reason" } ] } ] }` |

- One row per generation. “Current plan” = latest by `user_id` or the one user explicitly selects (Phase 1: just latest).

---

**`problems`**

| Column      | Type   | Description      |
| ----------- | ------ | ---------------- |
| id          | UUID   | PK               |
| external_id | TEXT   | e.g. LC slug     |
| title       | TEXT   |                  |
| link        | TEXT   |                  |
| topic       | TEXT   |                  |
| difficulty  | TEXT   | easy/medium/hard |
| patterns    | TEXT[] |                  |
| source      | TEXT   | e.g. "leetcode"  |

- Curated list; seed from Neetcode-style list or CSV. Optional later: `embedding` for “similar problems.”

---

**`upvotes`**

| Column     | Type        |
| ---------- | ----------- |
| user_id    | TEXT        |
| problem_id | UUID        |
| created_at | TIMESTAMPTZ |

- UNIQUE(user_id, problem_id). Prevents duplicate upvotes.

---

**`comments`**

| Column     | Type        | Description                                     |
| ---------- | ----------- | ----------------------------------------------- |
| id         | UUID        | PK                                              |
| user_id    | TEXT        |                                                 |
| problem_id | UUID        | FK                                              |
| body       | TEXT        |                                                 |
| tag        | TEXT        | too_hard / good_intro / pattern_practice / null |
| created_at | TIMESTAMPTZ |                                                 |

---

### 3.3 Indexes

- `intake_profiles(user_id)` UNIQUE.
- `intake_profiles` pgvector index: IVFFlat or HNSW on `embedding` (create after you have some rows).
- `plans(user_id, generated_at DESC)`.
- `upvotes(problem_id)`, `upvotes(user_id)`.
- `comments(problem_id)`.

---

## 4. FastAPI service layout (suggested)

```
backend/
  app/
    main.py              # FastAPI app, CORS, auth dependency
    auth.py              # JWT validation, get_user_id
    config.py            # env: DATABASE_URL, OPENAI_API_KEY, JWT_SECRET
    db.py                # SessionLocal, get_db
    models/              # SQLAlchemy or raw SQL
    schemas/             # Pydantic request/response
    routers/
      intake.py          # GET/PUT intake, embed & upsert
      plans.py           # POST generate, GET my plans
      problems.py        # GET list, GET by id, upvote, comment
    services/
      embed.py           # OpenAI embedding, single profile text
      orchestrator.py    # RAG (similar users + curated knowledge) + 1 LLM call
      knowledge.py       # Load topic progression / difficulty (file or DB)
```

- **Orchestrator:** Build context string from: (1) current user intake, (2) N similar profiles (pgvector by profile embedding), (3) curated topic/difficulty text, (4) optional: problem upvote counts / “too hard” counts per problem. One OpenAI chat completion; response = JSON plan → save to `plans`, return to client.

---

## 5. Next.js app layout (suggested)

```
frontend/
  app/
    (auth)/
      signin/
      signup/            # if email signup
    (app)/
      onboarding/       # 4–5 intake questions
      dashboard/         # current plan summary, CTA to problems
      plan/              # view/regenerate plan
      problems/
        [id]/            # problem page: link, topic, hints, upvote, comments
    api/                 # optional BFF: proxy to FastAPI with auth
  lib/
    auth.ts              # NextAuth config (Google, GitHub, email)
    api.ts               # fetch wrapper to FastAPI (add Bearer token)
```

- NextAuth config: Google + GitHub + Credentials (email). JWT callback: add `user_id` (and optionally email) to the token. Same JWT secret used in FastAPI to verify.

---

## 6. Environment / deployment

- **Frontend:** Next.js → Vercel (or Node server).
- **Backend:** FastAPI → Railway, Render, Fly, or a small VM. Set `DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET` (must match NextAuth secret).
- **Database:** One Postgres (Supabase, Neon, Railway Postgres, or RDS) with pgvector enabled.

**Option B:** NextAuth uses JWT only (no DB adapter), so it does not need Postgres. FastAPI has its own Postgres; no shared user table. Use the same `JWT_SECRET` / `NEXTAUTH_SECRET` in both apps so FastAPI can verify the token.

---

## 7. Fast path to first “personalized plan”

1. **Next.js:** NextAuth (Google + GitHub + email), onboarding page (form → POST to FastAPI intake).
2. **FastAPI:** Intake router writes to `intake_profiles`; after write, call OpenAI embed, store in `embedding`.
3. **FastAPI:** Orchestrator: read intake, (optional) similar profiles via pgvector, read static “topic progression” text, call OpenAI → parse JSON plan → save to `plans`, return.
4. **Next.js:** Dashboard/plan page GET plan from FastAPI, render.
5. Add **problems** table + seed data; **problem page** + upvote/comment; then add **community weighting** into orchestrator.

This keeps your differentiators (RAG-based personalization, community signal, plan regeneration) without extra services or ML infra.
