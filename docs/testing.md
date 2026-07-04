# Testing Strategy

**Stack:** Vitest + Testing Library (jsdom for components, node for API routes) + ESLint (`next/core-web-vitals`, `next/typescript`, jsx-a11y rules).
**Run:** `npm test` (watch: `npm run test:watch`; coverage: `npm run test:coverage`; lint: `npm run lint`). Current suite: **14 files, 61 tests, all passing; lint clean.**

## Philosophy

The app's contract with Gemini is *"real calls in production, deterministic seams in tests."* We test everything around the model — the prompts going in, the validation of what comes out, the auth/rate/error envelope, and the UI's loading/error/empty behavior — by mocking exactly one seam (`@/lib/gemini/client`). No feature logic is mocked; no test asserts on fake "AI" strings pretending to be product behavior.

## Layers

### 1. Unit — pure logic
| File | What it proves |
|---|---|
| `src/lib/gemini/json.test.ts` | JSON extraction survives code fences, leading prose, arrays; throws cleanly on garbage |
| `src/lib/rateLimit.test.ts` | Limit enforcement, 429 typing, per-user isolation |
| `src/lib/validation/requests.test.ts` | Sanitization (control chars, whitespace), length caps, enum rejection, date-window rules — the security perimeter |
| `src/lib/gemini/prompts/prompts.test.ts` | Every builder embeds user input inside fences, carries the injection guard, pins JSON contracts (e.g. era), and the storybook prompt lists real journey entries chronologically with the "do not invent visits" rule |

### 2. API routes — the full request pipeline (every feature covered)
`route.test.ts` files run in the node environment and mock only `requireAuth`, the Gemini client, and the journey store:

- `POST /api/discover`: 401 without auth (and Gemini is **not** called), 400 on invalid body (Gemini not called — validation precedes spend), 200 happy path returns recommendations *and* records a journey entry, traveler inputs verifiably reach the prompt, upstream failure maps to a clean 502.
- `POST /api/story`: streams `text/plain`, full stream content asserted, journey recorded, invalid focus → 400 before Gemini.
- `POST /api/time-portal`: era portrait returned, era pinned in the prompt contract, journey summary names the era, unknown era → 400.
- `POST /api/companions/chat`: reply returned, history threaded to Gemini, persona voice + destination in the system instruction, journey recorded **only** on the first message, unknown persona → 400.
- `POST /api/heritage` and `POST /api/events`: happy paths, journey side effects, date-window and destination validation rejections before any Gemini spend.
- `/api/storybook`: 409 `empty_journey` guard (no generation on empty logs), memoir generation is grounded in the real entries (prompt content asserted), result saved per-user, GET lists saved books.

### 3. Components — behavior + accessibility
- `Button`: click wiring, `disabled`, `loading` → `aria-busy` + disabled.
- `ErrorBanner`: `role="alert"` announcement, conditional retry wiring.
- `Markdown`: headings/lists/inline formatting render; **raw HTML in model output renders as inert text** (XSS regression test).

## Data-Flow Coverage, End to End

The pipeline `body → zod → prompt → model → zod → journey → response` is covered at every joint: requests.test (entry), prompts.test (middle), discover/storybook route tests (exit + side effects), Markdown test (render). A regression in any joint fails a test rather than a demo.

## Live-Integration Verification (real APIs, scripted)

Automated tests never spend Gemini quota. Two scripts exercise the real services using `.env.local`:

- `node scripts/verify-gemini.mjs` — one structured-JSON generation and one streamed narration through the same SDK paths the app uses.
- `node scripts/verify-firebase.mjs` — Admin SDK write/read/delete probe against live Firestore.

For the full HTTP chain before a demo: `npm run dev`, sign in as guest, run the golden path in `docs/demo-script.md`, and confirm `journeyEntries` + a `storybooks` document appear in the Firebase console.

## Extension Points

- Firestore rules tests via `@firebase/rules-unit-testing` (rules are currently simple enough to review by eye).
- Playwright smoke test of the golden path against a dev server with a test API key.
- Contract tests replaying recorded Gemini responses through the Zod schemas to catch model-drift early.
