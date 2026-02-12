# Auth smoke test

Run this after steps 3–5 are done to verify the auth system.

## 1. Install backend dependency

```powershell
cd roadmap-platform\backend
.\venv\Scripts\Activate.ps1
pip install PyJWT
```

## 2. Set environment variables

- **Backend:** `JWT_SECRET` must equal `NEXTAUTH_SECRET` from the frontend.
- **Frontend:** `.env.local` should have `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and OAuth keys (Google/GitHub) if you use them.

## 3. Start both servers

**Terminal 1 — Backend:**

```powershell
cd roadmap-platform\backend
.\venv\Scripts\Activate.ps1
$env:JWT_SECRET = "your-same-secret-as-nextauth"
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**

```powershell
cd roadmap-platform\frontend\codify
npm run dev
```

## 4. Test in the browser

1. Open **http://localhost:3000** → you should see the roadmap and a **Sign in** button.
2. Click **Sign in** → sign in with Google or GitHub (or email).
3. You should see your email and **Sign out**. The home page calls the backend `/me` when signed in and can show your `user_id`.
4. Tracks should still load (via `/api/backend/tracks` with JWT).
5. Click **Sign out** → **Sign in** appears again.

## 5. Test protected routes

1. While signed **out**, open **http://localhost:3000/dashboard**.
2. You should be redirected to **http://localhost:3000/signin?callbackUrl=/dashboard**.
3. Sign in → you should land back on `/dashboard` (or 404 if that page does not exist yet).
