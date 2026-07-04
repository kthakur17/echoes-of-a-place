# Security Strategy

## 1. Secrets Never Reach the Client

| Secret | Location | Exposure |
|---|---|---|
| `GEMINI_API_KEY` | Server env only; read inside `src/lib/gemini/client.ts` | Zero client access — all model calls happen in API routes |
| `FIREBASE_SERVICE_ACCOUNT_B64` | Server env only (base64 service-account JSON) | Admin SDK initialized server-side only |
| `NEXT_PUBLIC_FIREBASE_*` | Client bundle | **Public by design** — Firebase web config is not a secret; access control is enforced by Firestore rules + server token verification, never by hiding these values |

`.env*` files are gitignored; `.env.example` documents every variable without values. Nothing in `src/app/**/page.tsx` or `src/components` imports the Gemini or Admin SDKs (client/server boundary is structural, not conventional).

## 2. Authentication on Every Generative Endpoint

Every `/api/*` route begins with `requireAuth()`:
- Extracts `Authorization: Bearer <token>` and verifies it with `adminAuth().verifyIdToken()`.
- No token / bad token / expired token → `401` before any Gemini or Firestore work.
- Anonymous (guest) Firebase sessions are accepted — they are still real, rate-limitable identities — but **raw unauthenticated HTTP cannot use the API**, so the deployment can't be farmed as a free Gemini proxy.

## 3. Abuse & Cost Control

- Sliding-window rate limiter per `uid`: 15 req/min default, 30 for chat, **5 for storybook** (the most expensive generation). Exceeding → `429`.
- Known limitation, documented in `src/lib/rateLimit.ts`: the window is per-instance in-memory. On multi-instance serverless it becomes a soft limit; the upgrade path is a Firestore/Redis counter behind the same `checkRateLimit` interface.
- Payload bounds everywhere (10 interests, 30 chat turns, 90-day event window, 60 journey entries per memoir) cap worst-case token spend per request.

## 4. Input Validation & Prompt-Injection Defense (layered)

1. **Sanitize:** every user string passes `safeText` — Unicode control characters stripped, whitespace collapsed, hard length caps (destination 80, message 1000, goal 300…). Enums and dates are strictly validated; the events window is range- and order-checked.
2. **Fence:** sanitized input is embedded in angle-bracket tags (`<destination>…</destination>`) so prompts can distinguish data from instructions.
3. **Guard:** every system instruction includes `INJECTION_GUARD` — fenced text is untrusted data; role-change/"ignore your rules" requests are declined in character.
4. **Contain:** even a successful injection is low-blast-radius: the model has no tools, no function calling, and its output is schema-validated before anything downstream sees it.

## 5. Output Safety

- AI text is rendered through the dependency-free `Markdown` component, which builds **React text nodes only** — no `dangerouslySetInnerHTML` anywhere in the codebase. A model emitting `<img onerror=…>` renders as inert text (covered by a test).
- Structured responses are Zod-validated; unexpected shapes never reach the UI.

## 6. Firestore Rules — Deny by Default

```
users/{uid} and subcollections:  read → owner only;  write → DENIED
everything else:                 DENIED
```
All writes go through the Admin SDK in API routes, so every stored document has passed auth, rate limiting, and validation. Clients can read only their own journey/storybooks.

## 7. Error Hygiene & Headers

- One error funnel (`toErrorResponse`): Zod → 400 with field summary; auth → 401; rate → 429; Gemini → 502 with a generic message. Stack traces and upstream error bodies are logged server-side (`console.error`) and **never** serialized to clients.
- `next.config.ts` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, and removes `X-Powered-By`.

## 8. Data Minimization

We deliberately do **not** store chat transcripts, story texts, or era portraits — only one-line journey summaries and generated memoirs, both scoped to the owner. Less stored personal narrative = smaller breach surface and cheap GDPR-style deletion (delete the user subtree).
