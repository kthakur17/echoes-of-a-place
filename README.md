# 🏛️ Echoes of a Place

> **Tourists visit places. We help them have conversations with history.**

A production-ready GenAI cultural travel discovery platform. Most travel platforms answer *"Where should I go?"* — Echoes of a Place answers *"Why does this place matter?"* through AI-narrated stories, time travel across eras, conversations with local personas, endangered heritage discovery, and a personal journey memoir.

Every generative output is a **real, live Google Gemini API call** — no mock data, no canned responses, no hardcoded pages.

## The Seven Features

| # | Feature | What it does | Route |
|---|---------|-------------|-------|
| 1 | **AI Destination Discovery** | Input interests, budget, duration, style, and an *emotional goal* — get destinations with reasoning, hidden gems, and local experiences | `/discover` |
| 2 | **Cultural Story Engine** | Documentary-style narration of a place's history, legends, and traditions — **streamed live** as it's written | `/stories` |
| 3 | **Time Portal** | Explore the same destination in the Present, 50 Years Ago, 100 Years Ago, and the Ancient Era | `/time-portal` |
| 4 | **Cultural Companions** | Multi-turn chat with five in-character local personas (artisan, historian, storyteller, musician, food vendor) | `/companions` |
| 5 | **Hidden Heritage Explorer** | Endangered crafts, music, and traditions — why they matter, why they're vanishing, how visitors can help | `/heritage` |
| 6 | **Cultural Events Discovery** | Festivals and gatherings for your travel dates, with significance and visitor etiquette | `/events` |
| 7 | **AI Journey Storybook** | Your real exploration history compiled into a personal travel memoir, saved to Firestore | `/storybook` |

Features chain together: discover a place → hear its story → open its time portal → meet its people — the destination follows you, and **every step becomes a page in your storybook**.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS
- **Backend:** Next.js API Routes (Node runtime)
- **AI:** Google Gemini (`@google/genai`, default model `gemini-2.5-flash`) — server-side only
- **Database:** Firebase Firestore (Admin SDK server-side; locked-down security rules)
- **Auth:** Firebase Auth (Google + anonymous guest), ID tokens verified server-side
- **Testing:** Vitest + Testing Library (61 tests: unit, API route for every feature, component) + ESLint (next/core-web-vitals, TypeScript, jsx-a11y)

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in Gemini + Firebase values (see docs/deployment.md)
npm run dev                  # http://localhost:3000
npm test                     # run the test suite
npm run lint                 # ESLint (zero warnings expected)
npm run build                # production build

# live smoke tests against real services (uses .env.local):
node scripts/verify-gemini.mjs
node scripts/verify-firebase.mjs
```

You need: a [Gemini API key](https://aistudio.google.com/apikey), and a Firebase project with Auth (Google + Anonymous providers) and Firestore enabled. Full setup: [docs/deployment.md](docs/deployment.md).

## Documentation

| Deliverable | Location |
|---|---|
| System architecture + folder structure | [docs/architecture.md](docs/architecture.md) |
| Firestore database schema | [docs/firestore-schema.md](docs/firestore-schema.md) |
| User flows (all 7 features) | [docs/user-flows.md](docs/user-flows.md) |
| Wireframes (low-fidelity) | [docs/wireframes.md](docs/wireframes.md) |
| UI design system | [docs/design-system.md](docs/design-system.md) |
| API specifications + examples | [docs/api-spec.md](docs/api-spec.md) |
| Gemini prompt engineering strategy | [docs/prompt-engineering.md](docs/prompt-engineering.md) |
| Security strategy | [docs/security.md](docs/security.md) |
| Testing strategy | [docs/testing.md](docs/testing.md) |
| Deployment guide | [docs/deployment.md](docs/deployment.md) |
| Demo script | [docs/demo-script.md](docs/demo-script.md) |
