# Codify Frontend

This app is the Next.js frontend for Codify. It handles authentication, onboarding, dashboard flows, roadmap editing, and the proxy layer that forwards authenticated requests to the FastAPI backend.

## Development

```bash
npm install
scripts\init_db.cmd
npm run dev
```

Set `DATABASE_URL` before running the Prisma init script. The shared local default is:

```bash
postgresql://codify:codify@localhost:5432/codify
```

The app runs on `http://localhost:3000`.

## Useful Commands

```bash
npm run lint
npm run build
npm test
npm run db:init
```

`npm test` currently succeeds with `--passWithNoTests`, so it validates the test runner wiring but does not yet cover frontend behavior.

## Backend Integration

- Browser requests go through `/api/backend/[...path]`.
- Server-side backend calls use `BACKEND_API_URL`.
- The proxy signs backend auth tokens with the same shared secret family used by NextAuth.
- Prisma now expects `DATABASE_URL` instead of the old checked-in SQLite file.

## Current Notes

- Route protection lives in `proxy.ts`.
- Prisma migrations are checked in under `prisma/migrations`.
- The frontend no longer depends on fetching Google-hosted Geist fonts at build time.

## Main Areas

- `app/dashboard`: dashboard, deadlines, curated roadmaps
- `app/roadmaps`: roadmap view and editing flows
- `app/api`: registration, onboarding, auth, and backend proxy routes
- `components`: onboarding, modals, cards, and shared UI
