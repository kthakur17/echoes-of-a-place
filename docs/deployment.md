# Deployment Guide

## Prerequisites

- Node.js 20+ and npm
- A Google account (for Gemini + Firebase)
- Vercel account (recommended) or Firebase CLI for App Hosting

## Step 1 — Get a Gemini API Key

1. Open <https://aistudio.google.com/apikey> → **Create API key**.
2. Copy it — this is `GEMINI_API_KEY`. (Optional: set `GEMINI_MODEL`; default is `gemini-2.5-flash`.)

## Step 2 — Create the Firebase Project

1. <https://console.firebase.google.com> → **Add project** (e.g. `echoes-of-a-place`).
2. **Authentication → Sign-in method** → enable **Google** and **Anonymous**.
3. **Firestore Database → Create database** → production mode → pick a region.
4. **Project settings → General → Your apps → Web app (</>)** → register → copy the config object; those six values are the `NEXT_PUBLIC_FIREBASE_*` vars.
5. **Project settings → Service accounts → Generate new private key** → download the JSON, then base64-encode it:
   - PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json"))`
   - macOS/Linux: `base64 -w0 serviceAccountKey.json`
   - The result is `FIREBASE_SERVICE_ACCOUNT_B64`. Delete the downloaded JSON afterwards; never commit it.

## Step 3 — Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

## Step 4 — Run Locally

```bash
npm install
cp .env.example .env.local     # fill in all values from steps 1–2
npm test                       # 47 tests should pass
npm run dev                    # http://localhost:3000
```

Smoke check: sign in as guest → Discover → run a search → confirm three real recommendations and a new document under `users/{uid}/journeyEntries` in the Firestore console.

## Step 5 — Deploy to Vercel (recommended)

1. Push the repo to GitHub and import it at <https://vercel.com/new> (framework auto-detected: Next.js).
2. **Settings → Environment Variables** — add every variable from `.env.local`:
   `GEMINI_API_KEY`, `GEMINI_MODEL` (optional), `FIREBASE_SERVICE_ACCOUNT_B64`, and the six `NEXT_PUBLIC_FIREBASE_*` values.
3. Deploy. Note the production domain.
4. **Firebase Console → Authentication → Settings → Authorized domains** → add the Vercel domain (required for the Google sign-in popup).

> Serverless note: the in-memory rate limiter is per-instance on Vercel — acceptable for a demo/hackathon; swap in a Firestore/Redis counter for hard global limits (see `docs/security.md`).

### Alternative — Firebase App Hosting

Next.js 15 with dynamic API routes needs a server runtime, so use **App Hosting** (not classic static Hosting): Firebase console → **App Hosting** → connect the GitHub repo → set the same env vars (secrets via Cloud Secret Manager when prompted) → deploy.

## Step 6 — Post-Deploy Verification

1. Open the production URL → sign in with Google.
2. Run one call per feature (Discover, a streamed Story, one Time-Portal era, one Companion message, Heritage, Events, then generate the Storybook).
3. Verify Firestore documents appear under your uid, and `/api/discover` without an `Authorization` header returns `401` (e.g. via curl) — confirming the API is not an open proxy.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `GEMINI_API_KEY is not configured` | Env var missing in `.env.local` / Vercel — restart dev server after edits |
| `FIREBASE_SERVICE_ACCOUNT_B64 is not configured` or JSON parse error | Re-encode the service account file; ensure one unbroken base64 line |
| Google popup closes immediately in prod | Add your domain to Firebase **Authorized domains** |
| 401 on every API call while signed in | Client and server point at different Firebase projects — compare `NEXT_PUBLIC_FIREBASE_PROJECT_ID` with the service account's `project_id` |
| 429 during demos | Per-user limits (15/min; storybook 5/min) — wait a minute or relax limits in `src/lib/rateLimit.ts` |
