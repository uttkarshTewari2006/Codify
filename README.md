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
set DATABASE_URL=postgresql://codify:codify@localhost:5432/codify
scripts\init_db.cmd
npm run dev
```

The frontend runs on `http://localhost:3000`.

### Backend

```bash
cd roadmap-platform/backend
# Windows
scripts\bootstrap_backend_env.cmd
# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn main:app --reload
```

The backend runs on `http://localhost:8000`.

## Environment Notes

- Browser traffic stays on the frontend origin and goes through `/api/backend/[...path]`.
- Server-side backend calls use `BACKEND_API_URL`.
- Frontend and backend now share a Postgres-first `DATABASE_URL`.
- Backend CORS is env-driven through `CORS_ORIGINS`.
- Backend JWT validation uses `JWT_SECRET` and falls back to `NEXTAUTH_SECRET`.
- In deployed environments, set the backend `JWT_SECRET` to the same value as the frontend `NEXTAUTH_SECRET`.
- Chroma persistence is env-driven through `CHROMA_PERSIST_DIR`.

## Verification

### Frontend

```bash
cd roadmap-platform/frontend/codify
npm run lint
npm run build
npm test
```

The frontend test script currently runs Vitest with `--passWithNoTests`, so it succeeds even though no frontend test files are checked in yet.

### Backend

```bash
cd roadmap-platform/backend
.venv\Scripts\python.exe -m pytest tests -q
```

### Bootstrap

```bash
docker compose up -d postgres
cd roadmap-platform/frontend/codify
scripts\init_db.cmd
cd ../../backend
.venv\Scripts\python.exe scripts\seed_golden_data.py
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

## Deployment

- `docker-compose.yml` runs Postgres, the FastAPI backend, and the Next.js frontend together.
- `roadmap-platform/backend/Dockerfile` builds the API image.
- `roadmap-platform/frontend/codify/Dockerfile` builds the frontend image.
