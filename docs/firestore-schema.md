# Firestore Database Schema

All data is per-user, under `users/{uid}`. Writes happen **exclusively server-side** through the Admin SDK; clients have read-only access to their own documents (enforced by `firestore.rules`).

## Collections

### `users/{uid}/journeyEntries/{entryId}`

One document per meaningful cultural interaction — appended automatically by every feature API route. This is the raw material for the Journey Storybook.

| Field | Type | Description |
|---|---|---|
| `type` | string | `discovery` \| `story` \| `time-portal` \| `companion-chat` \| `heritage` \| `events` |
| `destination` | string | Place(s) the interaction concerned |
| `summary` | string | One-sentence human-readable record, written by the API route (e.g. *"Stepped into Varanasi in the era '100 Years Ago' (c. 1920s)."*) |
| `createdAt` | number | Epoch milliseconds |

Example document:

```json
{
  "type": "companion-chat",
  "destination": "Jaipur, India",
  "summary": "Struck up a conversation with Meera, Master Artisan, in Jaipur — opening with: \"How is blue pottery made?\".",
  "createdAt": 1780560000000
}
```

Query used by the app: `orderBy("createdAt", "asc").limit(60)` — single-field index, no composite index required.

### `users/{uid}/storybooks/{storybookId}`

Generated travel memoirs (Feature 7), one document per generation.

| Field | Type | Description |
|---|---|---|
| `title` | string | e.g. *"Kunal's Journey Through Living History"* |
| `dedication` | string | Second-person dedication |
| `chapters` | array | `[{ heading: string, body: string }]` — 3–8 chapters, 150–250 words each |
| `epilogue` | string | Closing reflection |
| `createdAt` | number | Epoch milliseconds |

Query used by the app: `orderBy("createdAt", "desc").limit(20)`.

### `users/{uid}` (document)

Reserved for future profile preferences (home region, saved destinations). Currently no fields are written; auth profile data (display name, photo) lives in Firebase Auth, not Firestore, to avoid duplication.

## Why chats and generated stories are NOT persisted

Story narrations, era portraits, and full chat transcripts are ephemeral by design: they are cheap to regenerate, personal-data-light, and storing full transcripts would grow unbounded. What we keep is the **journey entry summary** — enough for the memoir to be truthful about what the user explored without warehousing every token. This is a deliberate data-minimization choice (see `docs/security.md`).

## Security Rules Summary (`firestore.rules`)

```
users/{userId}                    read: owner only   write: denied (server only)
users/{userId}/journeyEntries/**  read: owner only   write: denied (server only)
users/{userId}/storybooks/**      read: owner only   write: denied (server only)
everything else                   denied
```

The Admin SDK bypasses rules, which is exactly the intent: the API layer is the only writer, so every document passes through validation, rate limiting, and auth first.
