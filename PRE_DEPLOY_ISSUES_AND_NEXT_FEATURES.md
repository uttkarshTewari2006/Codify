# Codify Pre-Deploy Issues And Next Features

Generated: 2026-04-28

## Purpose

This document tracks the issues that should be addressed before deploying Codify or presenting it as a polished product, plus the next feature request that should be planned into the roadmap.

## Current Pre-Deploy Issues

### 1. Frontend quality gate is failing

- `eslint` currently reports multiple errors and warnings across the frontend.
- There is a real hook-order issue in `roadmap-platform/frontend/codify/app/dashboard/page.tsx` where functions are used before declaration.
- There are also several `any` typing issues, unused variables, unescaped apostrophes in JSX, and shared UI typing issues.

Why this matters:
- The app is not release-clean.
- This increases the risk of regressions and lowers confidence during a demo or deployment.

### 2. Runtime configuration is still development-oriented

- Backend database access is hardcoded to the local SQLite file in `roadmap-platform/backend/database.py`.
- Backend CORS currently allows only `http://localhost:3000`.
- Frontend backend access defaults to `http://localhost:8000` when env vars are not set.
- Backend `.env.example` suggests env-driven DB config, but the backend code does not currently honor it.

Why this matters:
- Deployment config is not portable.
- Production and staging environments cannot be configured cleanly.

### 3. Frontend build is environment-sensitive

- The frontend uses `next/font/google` for Geist fonts in `roadmap-platform/frontend/codify/app/layout.tsx`.
- Production build failed in the current environment because the build process could not fetch Google font assets.
- Next.js 16 also warns that `middleware.ts` should move to `proxy.ts`.

Why this matters:
- Builds should be reproducible and not depend on incidental machine/network conditions.
- Deprecation warnings should be cleaned up before release.

### 4. Documentation does not fully match the actual repo state

- The root `README.md` claims frontend test commands that are not currently wired up as runnable project scripts.
- The root `README.md` says to start the backend with `python main.py`, but `main.py` defines the FastAPI app and does not launch Uvicorn by itself.
- The frontend `README.md` is still the default create-next-app template and does not describe the real product.
- Some architecture and setup docs still mix current implementation with aspirational future-state deployment architecture.

Why this matters:
- Setup friction increases for reviewers and collaborators.
- Product claims can drift from what the code actually supports.

### 5. Backend local environment is not currently reproducible from this checkout

- The checked-in backend virtual environment points to a missing Windows Store Python path.
- Local backend validation could not be rerun from the existing venv as-is.
- Backend test dependencies are installed in CI separately, instead of being fully represented in the main dependency flow.

Why this matters:
- Local verification should work from a clean checkout.
- Reproducibility problems create avoidable deployment and demo risk.

### 6. Local generated data and mutable artifacts are mixed into the repo state

- `prisma/dev.db` is tracked and locally modified.
- `backend/chroma_db/*` is tracked and locally modified.
- The repo currently contains mutable local state that should be treated more carefully before deployment.

Why this matters:
- Local state can leak into commits.
- Deployment setup becomes less deterministic.

### 7. Database migration/bootstrap story is incomplete

- Prisma migrations are not present in `roadmap-platform/frontend/codify/prisma/migrations`.
- The project currently depends heavily on local seeded and mutable DB state.

Why this matters:
- A fresh environment needs a reliable bootstrap path.
- Deployment should not rely on manually prepared local state.

### 8. Some product/admin flows are still placeholders or partial

- Feedback monitoring is still a placeholder in the backend.
- There are still "Phase 2" references in the codebase.
- Some internal admin/product behaviors are not yet at a production-ready maturity level.

Why this matters:
- Demo expectations should match implemented functionality.
- Placeholder flows should not be presented as complete product surfaces.

### 9. Reported RAG issue: seeded URLs are not showing up in retrieval/generation

Reported issue:
- URLs were added to the seed knowledge documents, but the RAG pipeline does not appear to surface those URLs in the generated outputs.

Likely areas to inspect:
- `roadmap-platform/backend/seed_data/knowledge/*.md`
- `roadmap-platform/backend/knowledge_base.py`
- `roadmap-platform/backend/generator.py`
- Existing Chroma persisted data in `roadmap-platform/backend/chroma_db`

Initial hypotheses to verify:
- The updated knowledge docs may not have been re-ingested after the URLs were added.
- The chunking strategy may be splitting or burying links in a way that reduces retrieval usefulness.
- The retrieved chunks may not be the chunks that actually contain the URLs.
- The generator prompt may be too strict or too weak in how it uses retrieved link-bearing context.
- The Chroma collection may still reflect older embeddings/doc content instead of the newest seeded docs.

Why this matters:
- RAG quality is one of the main differentiators of the project.
- If curated URLs are not reliably retrieved and used, the roadmap output becomes less grounded and less useful.

## New Feature Request

### Community roadmap and discussion layer

Add the ability for users to:

- post roadmaps publicly
- create discussions around roadmaps
- comment on roadmaps and discussions
- share roadmaps/discussions
- upvote roadmaps/discussions
- fork public roadmaps into their own workspace

## Feature Breakdown

### Core user actions

- A user can publish one of their roadmaps to a public feed.
- Other users can open the published roadmap and discuss it.
- Users can comment directly on a roadmap or on a discussion thread.
- Users can upvote useful roadmaps and discussions.
- Users can fork a public roadmap into their own personal dashboard.
- Users can share public roadmap links externally.

### Suggested initial MVP scope

- Public roadmap publishing toggle
- Public roadmap detail page
- Discussion thread per public roadmap
- Comments on roadmap discussions
- Upvotes for roadmaps
- Upvotes for discussion threads
- Fork public roadmap into personal workspace
- Shareable public URL for each published roadmap

### Suggested backend/data model additions

Potential new entities:

- `PublishedRoadmap`
- `RoadmapPost`
- `DiscussionThread`
- `DiscussionComment`
- `RoadmapUpvote`
- `DiscussionUpvote`
- `RoadmapShare` or share metadata/events

Potential questions to resolve during implementation:

- Does publishing create a snapshot, or does it stay linked to the editable private roadmap?
- Can users comment directly on the roadmap, or only within named discussion threads?
- Are forks deep copies or linked derivatives?
- Should roadmap visibility support `private`, `unlisted`, and `public`?
- Should admins be able to moderate posts, comments, and discussions?

### Why this feature is valuable

- It adds community and retention loops, not just one-time roadmap generation.
- It turns good roadmaps into reusable assets.
- It creates product differentiation beyond solo planning.
- It makes upvotes and forks useful product-quality signals over time.

## Recommended Fix Order Before Deploying

1. Fix frontend lint and build issues.
2. Make runtime config fully env-driven.
3. Repair local backend reproducibility and rerun backend tests locally.
4. Clean up tracked mutable artifacts and define a proper bootstrap/migration flow.
5. Fix the RAG URL-ingestion/retrieval issue and verify with a focused retrieval test.
6. Update docs so they match the actual product and setup steps.
7. Only after that, scope and implement the community roadmap/discussion feature.

## Notes For The Next Pass

- The RAG URL issue should be treated as a product-quality bug, not a minor polish issue.
- The community feature should be designed carefully so it does not get bolted onto the current private-roadmap model in a way that creates schema or permission problems later.
- Before public launch, the product narrative should stay aligned with what is implemented today, not what is planned next.
