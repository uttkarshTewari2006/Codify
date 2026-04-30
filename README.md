# Codify

Codify is a roadmap-building product with a Next.js frontend and a FastAPI backend. It generates personalized learning plans, lets users edit tasks and deadlines, and uses a RAG knowledge base to ground roadmap generation.

## Repo Layout

- `roadmap-platform/frontend/codify`: Next.js 16 app, NextAuth, Prisma client, dashboard UI
- `roadmap-platform/backend`: FastAPI API, SQLModel models, roadmap generation, Chroma-backed RAG

## Current Product Scope

- Personalized roadmap generation from onboarding inputs
- Roadmap editing, task management, and deadline tracking
- Curated roadmaps that can be forked into a user workspace
- Admin RAG controls for ingestion, stats, and retrieval testing

## Local Development

### Frontend

```bash
cd roadmap-platform/frontend/codify
npm install
npx prisma generate
npm run dev
```

The frontend runs on `http://localhost:3000`.

### Backend

```bash
cd roadmap-platform/backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs on `http://localhost:8000`.

## Environment Notes

- Browser traffic stays on the frontend origin and goes through `/api/backend/[...path]`.
- Server-side backend calls use `BACKEND_API_URL`.
- Backend database access is env-driven through `DATABASE_URL`, with a local SQLite fallback for development.
- Backend CORS is env-driven through `CORS_ORIGINS`.
- Backend JWT validation uses `JWT_SECRET` and falls back to `NEXTAUTH_SECRET`.
- In deployed environments, set the backend `JWT_SECRET` to the same value as the frontend `NEXTAUTH_SECRET`.

## Verification

### Frontend

```bash
cd roadmap-platform/frontend/codify
npm run lint
npm run build
```

`package.json` does not currently define frontend `test` or Playwright scripts.

### Backend

```bash
cd roadmap-platform/backend
pytest
```

### RAG Validation

```bash
cd roadmap-platform/backend
python scripts/validate_rag_quality.py
```

## RAG Assets

- Knowledge documents: `roadmap-platform/backend/seed_data/knowledge`
- Vector store: `roadmap-platform/backend/chroma_db`
- Admin ingest route: `POST /admin/rag/ingest`

## Known Gaps

- Docker deployment wiring is not defined yet.
- Production database rollout should move to Postgres instead of the current SQLite-oriented local default.
- Prisma migrations are not yet present for a clean bootstrap flow.
