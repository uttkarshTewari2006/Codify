# Codify Next-Step Validation And Deployment Runbook

Generated: 2026-05-01

## Purpose

This document replaces the old pre-deploy issue list. The code changes are in place; the next step is to prove they work end to end.

## 1. Prepare Environment Variables

Create a root `.env` from [`.env.example`](</C:/Users/uttka/OneDrive/Documents/Uttkarsh/codify/.env.example>) and set real values for:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `BACKEND_API_URL`
- `OPENAI_API_KEY`

Important:

- `NEXTAUTH_SECRET` and `JWT_SECRET` should match.
- `CORS_ORIGINS` must equal the public frontend origin.
- If the frontend and backend are deployed in the same Docker Compose stack, `BACKEND_API_URL` should stay `http://backend:8000`.
- If the frontend is deployed separately, `BACKEND_API_URL` should be the backend's public URL instead.

## 2. Local Docker Validation

From the repo root:

```powershell
docker compose up -d --build
docker compose ps
```

Expected result:

- `postgres` is healthy
- `backend` is running
- `frontend` is running

If something fails:

- `docker compose logs postgres --tail=100`
- `docker compose logs backend --tail=100`
- `docker compose logs frontend --tail=100`

## 3. Initialize The Database

After the stack is up, run the Prisma migration against Postgres:

```powershell
docker compose run --rm frontend npx prisma migrate deploy
```

Expected result:

- Prisma reports that the migration ran successfully

## 4. Seed Golden Test Data

Run the backend seed script to populate SQL data and rebuild Chroma:

```powershell
docker compose run --rm backend python scripts/seed_golden_data.py
```

Expected result:

- The script prints `Golden SQL data and Chroma index seeded successfully.`

What this seeds:

- one admin user record
- one roadmap
- two tasks
- one deadline
- one feedback log
- a fresh Chroma index built from the knowledge docs

## 5. Smoke Test The App

Open these URLs locally:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:8000/`

Expected result:

- frontend loads without a server error
- backend returns `{"message":"Roadmap API is alive!"}` or equivalent JSON

Then verify the main user flows manually:

1. Sign in.
2. Complete onboarding.
3. Generate a roadmap.
4. Open a roadmap task.
5. Edit a task.
6. Add or edit a deadline.
7. Regenerate a roadmap and confirm the app still loads the new tasks.

## 6. Validate RAG Retrieval

### Fast deterministic check

Run a direct retrieval query inside the backend container:

```powershell
docker compose run --rm backend python -c "from knowledge_base import KnowledgeBase; kb=KnowledgeBase(); results=kb.query('FastAPI backend roadmap', top_k=3); print(results[0]['metadata']['source']); print(results[0]['metadata']['urls'])"
```

Expected result:

- at least one knowledge document is returned
- `metadata["urls"]` is populated
- the URLs come from [metadata.json](</C:/Users/uttka/OneDrive/Documents/Uttkarsh/codify/roadmap-platform/backend/seed_data/knowledge/metadata.json>), not from the markdown body

### Probabilistic quality check

Run the existing evaluator:

```powershell
docker compose run --rm backend python scripts/validate_rag_quality.py
```

Expected result:

- a `rag_validation_report.json` file is generated
- retrieval relevance is strong enough for the three built-in test prompts

### End-to-end URL grounding check

Generate a roadmap in the UI for one of these prompts:

- backend developer with Python and FastAPI
- full-stack developer with Next.js and APIs
- devops engineer with Docker and Kubernetes

Then inspect the generated task links.

Pass criteria:

- task links are real URLs
- task links match sources listed in knowledge metadata
- task links do not include hallucinated domains
- task links stay present after regeneration when the retrieved context supports them

## 7. Validate Admin And Feedback Data

After regenerating a roadmap with written feedback, confirm the feedback was persisted.

Quick DB-level check from the backend container:

```powershell
docker compose run --rm backend python -c "from sqlmodel import Session, select; from database import engine, FeedbackLog; session=Session(engine); print(len(session.exec(select(FeedbackLog)).all()))"
```

Expected result:

- the count is greater than zero

## 8. Deploy The Website

### Option A: Deploy the full stack on one server with Docker Compose

On the target server:

1. Install Docker and the Docker Compose plugin.
2. Copy the repo to the server.
3. Create a production `.env` from [`.env.example`](</C:/Users/uttka/OneDrive/Documents/Uttkarsh/codify/.env.example>).
4. Set production secrets and URLs.
5. Run:

```powershell
docker compose up -d --build
docker compose run --rm frontend npx prisma migrate deploy
docker compose run --rm backend python scripts/seed_golden_data.py
```

### Option B: Deploy the frontend and backend separately

Use the existing Dockerfiles:

- [backend/Dockerfile](</C:/Users/uttka/OneDrive/Documents/Uttkarsh/codify/roadmap-platform/backend/Dockerfile>)
- [frontend/Dockerfile](</C:/Users/uttka/OneDrive/Documents/Uttkarsh/codify/roadmap-platform/frontend/codify/Dockerfile>)

Required environment rules:

- frontend `NEXTAUTH_URL` must equal the public frontend URL
- frontend `BACKEND_API_URL` must equal the backend URL reachable from the frontend runtime
- backend `CORS_ORIGINS` must include the frontend public origin
- backend and frontend `DATABASE_URL` must point at the same Postgres database

## 9. How To Get The Deployed URL

### If you deploy on a VM with Docker Compose

Your temporary public site URL is:

- `http://<SERVER_PUBLIC_IP>:3000`

How to get the IP:

- check your cloud provider VM dashboard, or
- run `curl ifconfig.me` on the server

For production, point a domain or subdomain to that server and use:

- frontend URL: `https://app.yourdomain.com`
- backend URL: `https://api.yourdomain.com` if exposed publicly, or `http://backend:8000` if only used internally by the frontend container

### If you deploy to a managed host

The host dashboard will show the generated service URL after deployment. Use that displayed URL to set:

- `NEXTAUTH_URL` for the frontend
- `CORS_ORIGINS` on the backend
- `BACKEND_API_URL` if the frontend must call a public backend URL

## 10. Post-Deploy Verification

After deployment, run these checks against the live site:

1. Open the deployed frontend URL.
2. Sign in successfully.
3. Complete onboarding.
4. Generate a roadmap.
5. Open a generated task and verify links load real sources.
6. Regenerate the roadmap with feedback.
7. Confirm the regenerated roadmap still contains grounded links.
8. Hit the backend root URL and confirm it responds.

## 11. Exit Criteria

The deployment is ready when all of the following are true:

- Docker services start cleanly
- Prisma migration succeeds against Postgres
- golden SQL data and Chroma seed succeed
- frontend loads and backend root responds
- roadmap generation works
- regeneration works
- feedback persistence works
- RAG retrieval returns metadata-backed URLs
- generated task links stay grounded to known sources
- the deployed site has a stable public URL and correct env configuration
