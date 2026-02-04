# Codify — Learning & Stack Decisions

Notes on how the Phase 1 MVP stack and product flow were chosen.

---

## Product flow

- **Frontend:** Onboarding → dashboard → problem/resources pages → custom plan-generating page
- **Backend:** Authentication, CRUD, orchestrator (RAG + plan generation)
- **UI:** Figma AI for UI for now

---

## Database choice

- Need tables for users, plans, lessons, community posts, community replies, etc. → use a **relational database**
- **MySQL vs PostgreSQL:** MySQL performs better for read-heavy workloads; PostgreSQL for write-heavy. MySQL is easier for some. Queries here are basic (fetch posts, plans, problems per user via simple `JOIN`). **Chose PostgreSQL** (and pgvector for embeddings)

---

## Backend choice

- **Next.js API vs FastAPI:** Next.js gives an all-TypeScript codebase; FastAPI is Python with better fit for ML/RAG and integrations. FastAPI is also quick to work with. **Chose FastAPI**

---

## Frontend choice

- **SPA (React/Next/Vue) vs Next.js:** Next.js gives better SEO, stronger routing and API routes, and faster initial loads. **Chose Next.js**

---

## LLM provider

- **Chose OpenAI** for plan generation and orchestrator

---

## Locked stack (Phase 1 MVP)

| Layer         | Choice                                                     |
| ------------- | ---------------------------------------------------------- |
| Frontend      | **Next.js**                                                |
| Backend       | **FastAPI** (Python)                                       |
| Database      | **PostgreSQL + pgvector**                                  |
| LLM           | **OpenAI**                                                 |
| Auth          | **Email + OAuth** (Google + GitHub)                        |
| Auth strategy | **Option B: JWT-only** (no session DB; FastAPI trusts JWT) |

→ See **ARCHITECTURE.md** for schema, auth flow (NextAuth ↔ FastAPI), and service layout.
