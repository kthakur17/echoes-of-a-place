# System Architecture

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            BROWSER (Client)                          │
│                                                                      │
│  Next.js 15 App Router pages (React 19, Tailwind)                    │
│  /discover /stories /time-portal /companions /heritage /events       │
│  /storybook                                                          │
│                                                                      │
│  ┌──────────────┐   ┌────────────────────┐   ┌───────────────────┐  │
│  │ AuthProvider │   │ DestinationContext │   │ api.ts            │  │
│  │ Firebase Auth│   │ (place follows you │   │ postJson/getJson/ │  │
│  │ Google+Guest │   │  across features)  │   │ postStream        │  │
│  └──────┬───────┘   └────────────────────┘   └────────┬──────────┘  │
└─────────┼──────────────────────────────────────────────┼────────────┘
          │ sign-in (popup / anonymous)                   │ fetch + Bearer <Firebase ID token>
          ▼                                               ▼
┌──────────────────┐            ┌──────────────────────────────────────┐
│  Firebase Auth   │            │      Next.js API Routes (Node)       │
│  (Google + anon) │            │                                      │
└──────────────────┘            │  1. requireAuth() ── verifyIdToken ──┼──► Firebase Admin Auth
                                │  2. checkRateLimit(uid)              │
                                │  3. zod request validation           │
                                │  4. prompt builder (pure fn)         │
                                │  5. Gemini call (JSON / stream / chat)┼──► Google Gemini API
                                │  6. zod response validation (+retry) │    (GEMINI_API_KEY —
                                │  7. recordJourneyEntry(uid)          │     server env only)
                                │  8. safe JSON / text stream response │
                                └──────────────────┬───────────────────┘
                                                   │ Admin SDK (service account)
                                                   ▼
                                ┌──────────────────────────────────────┐
                                │         Firebase Firestore           │
                                │  users/{uid}/journeyEntries/{id}     │
                                │  users/{uid}/storybooks/{id}         │
                                │  (client writes DENIED by rules —    │
                                │   server-only writes via Admin SDK)  │
                                └──────────────────────────────────────┘
```

## Request Lifecycle (every generative endpoint)

1. **Auth** — `requireAuth()` verifies the Firebase ID token via the Admin SDK. No token → 401. This means the Gemini key can never be used as an open proxy.
2. **Rate limit** — sliding-window limiter per `uid` (15/min default, 30/min chat, 5/min storybook).
3. **Validate** — Zod schema sanitizes (control chars stripped, whitespace collapsed, length caps) and type-checks the body. Invalid → 400 with field-level detail.
4. **Build prompt** — pure functions in `src/lib/gemini/prompts/` fence user input in tags and pair it with a feature-specific system instruction.
5. **Generate** — `generateStructured` (JSON + Zod validation + one corrective retry), `generateNarrationStream` (streamed prose), or `generateChatReply` (multi-turn).
6. **Record journey** — the interaction is summarized into `users/{uid}/journeyEntries` (non-fatal on failure) so Feature 7 can compile a real memoir.
7. **Respond** — `{ data: ... }` envelope, or `{ error: { code, message } }` with correct status. Internal details never leak.

## Key Design Decisions

- **All AI + Firestore access is server-side.** The client holds only a Firebase session. `GEMINI_API_KEY` and the service account exist only in server env vars.
- **Structured output with corrective retry.** Gemini is asked for `application/json`; output is validated with Zod. On mismatch, the model gets one retry containing its validation errors. Enum-ish fields use `.catch()` fallbacks so one creative label doesn't fail a whole response.
- **Streaming where it matters.** The Story Engine streams prose token-by-token (`ReadableStream` → `postStream`) — the "narrator writing live" is the feature's emotional core.
- **Journey tracking is a side effect, not a burden.** Every feature call appends one summarized entry; the Storybook compiles only what the user actually explored (verified by the 409 `empty_journey` guard and prompt grounding tests).
- **Personas are data.** `src/lib/personas.ts` defines voice + UI metadata in one place; adding a sixth persona is one object literal.

## Folder Structure

```
echoes-of-a-place/
├── docs/                          # All 12 hackathon deliverables
├── firebase.json                  # Firebase project config
├── firestore.rules                # Locked-down security rules
├── firestore.indexes.json
├── .env.example                   # Every required env var, documented
├── next.config.ts                 # Security headers, tracing root
├── tailwind.config.ts             # Design tokens (ink/parchment/ember/sage)
├── vitest.config.ts / vitest.setup.ts
└── src/
    ├── types/index.ts             # Shared domain models (single source of truth)
    ├── app/
    │   ├── layout.tsx             # Fonts, skip link, providers, nav, footer
    │   ├── page.tsx               # Landing page
    │   ├── globals.css            # Theme vars, focus rings, reduced motion
    │   ├── discover/page.tsx      # Feature 1
    │   ├── stories/page.tsx       # Feature 2 (streaming)
    │   ├── time-portal/page.tsx   # Feature 3
    │   ├── companions/page.tsx    # Feature 4
    │   ├── heritage/page.tsx      # Feature 5
    │   ├── events/page.tsx        # Feature 6
    │   ├── storybook/page.tsx     # Feature 7
    │   └── api/
    │       ├── discover/route.ts        (+ route.test.ts)
    │       ├── story/route.ts           # streams text/plain
    │       ├── time-portal/route.ts
    │       ├── companions/chat/route.ts
    │       ├── heritage/route.ts
    │       ├── events/route.ts
    │       ├── storybook/route.ts       # POST generate, GET list (+ route.test.ts)
    │       └── journey/route.ts         # GET journey log
    ├── components/
    │   ├── auth/AuthProvider.tsx  # Firebase session context
    │   ├── auth/AuthGate.tsx      # Sign-in wall for feature pages
    │   ├── layout/Navbar.tsx / Footer.tsx
    │   └── ui/                    # Button, Card, Chip, Skeleton, ErrorBanner,
    │                              # EmptyState, Markdown, PageHeader, DestinationField
    └── lib/
        ├── api.ts                 # Client fetch helpers (token attach, stream reader)
        ├── apiError.ts            # ApiError + safe error mapping
        ├── rateLimit.ts           # Sliding-window limiter
        ├── personas.ts            # The five companion definitions
        ├── destinationContext.tsx # Cross-feature destination state
        ├── auth/server.ts         # requireAuth (ID token verification)
        ├── journey/server.ts      # Journey entries + storybooks (Admin SDK)
        ├── firebase/client.ts     # Client auth only
        ├── firebase/admin.ts      # Admin app (service account from env)
        ├── validation/requests.ts # Zod request schemas (sanitizing)
        ├── validation/responses.ts# Zod schemas for Gemini output
        └── gemini/
            ├── client.ts          # generateStructured / NarrationStream / ChatReply
            ├── json.ts            # Fence-tolerant JSON extraction
            └── prompts/           # One pure prompt builder per feature + shared guard
```
