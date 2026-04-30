# Codify Frontend

This app is the Next.js frontend for Codify. It handles authentication, onboarding, dashboard flows, roadmap editing, and the proxy layer that forwards authenticated requests to the FastAPI backend.

## Development

```bash
npm install
npx prisma generate
npm run dev
```

The app runs on `http://localhost:3000`.

## Useful Commands

```bash
npm run lint
npm run build
```

There is currently no `npm test` script wired in `package.json`.

## Backend Integration

- Browser requests should go through `/api/backend/[...path]`.
- Server-side backend calls use `BACKEND_API_URL`.
- The proxy signs backend auth tokens with the same shared secret family used by NextAuth.
- Keeping browser traffic on `/api/backend` avoids exposing an internal backend hostname in the client bundle and lets frontend and backend ship behind one public origin.

## Current Notes

- Route protection now lives in `proxy.ts`.
- Prisma is configured against the local SQLite file at `prisma/dev.db` for development.
- The frontend no longer depends on fetching Google-hosted Geist fonts at build time.

## Main Areas

- `app/dashboard`: dashboard, deadlines, curated roadmaps
- `app/roadmaps`: roadmap view and editing flows
- `app/api`: registration, onboarding, auth, and backend proxy routes
- `components`: onboarding, modals, cards, and shared UI
