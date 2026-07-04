# UI Design System

The visual language is "**illuminated manuscript at dusk**" — a dark, atmospheric base that makes AI-narrated text feel like storytelling by lamplight, with warm amber accents and parchment-toned type.

## Color Tokens (`tailwind.config.ts`)

| Token | Hex | Role |
|---|---|---|
| `ink-950` | `#0c0a12` | Page background |
| `ink-900` | `#141020` | Card surfaces |
| `ink-800` | `#1d1830` | Inputs, raised surfaces, chat bubbles |
| `ink-700` | `#2a2342` | Borders, dividers |
| `parchment-50` | `#faf6ee` | Headings |
| `parchment-100` | `#f1e9d8` | Body text (at 90% opacity for long prose) |
| `parchment-300/400` | `#d9c9a8` / `#c4ad82` | Secondary text, labels, muted |
| `ember-300..600` | `#f0c274` → `#b57722` | Accent: CTAs, kickers, selected states, headings in narration |
| `sage-300..500` | `#9ec5ab` → `#5c8f6f` | Positive/supportive: "how to help", etiquette, "what survives" panels |
| Red/orange (Tailwind) | — | Errors and urgency badges only |

Background carries two fixed radial gradients (amber top, sage bottom-right) for depth without images.

**Contrast:** body text `parchment-100` on `ink-900` ≈ 13:1; muted `parchment-400` on `ink-900` ≈ 6.5:1; `ember-300` on `ink-950` ≈ 9:1 — all beyond WCAG AA (4.5:1).

## Typography

| Face | Usage |
|---|---|
| **Fraunces** (`--font-display`, serif) | Page titles, card headings, narration headings (italic), storybook chapters |
| **Inter** (`--font-body`, sans) | Body, forms, UI chrome |

Loaded via `next/font/google` with `display: swap` and system-font fallbacks. Scale: hero `text-4xl→6xl`, page titles `text-3xl/4xl`, section headings `text-xl/2xl`, body `text-sm/base`, kickers `text-xs uppercase tracking-[0.2em]`.

## Components (`src/components/ui/`)

| Component | Notes |
|---|---|
| `Button` | `primary` (ember fill) / `secondary` (outlined) / `ghost`. `loading` prop renders spinner + `aria-busy` + disables. |
| `Card` | `rounded-xl`, ink-900 surface, ink-700 border, soft shadow. The universal container. |
| `Chip` | Toggleable pill, `role="checkbox"` + `aria-checked`. Interest picker. |
| `SkeletonCard` / `LoadingRegion` | Shimmer placeholders inside a `role="status" aria-live="polite"` wrapper with `sr-only` label. Required on every data-heavy screen — no blank screens, no bare spinners. |
| `ErrorBanner` | `role="alert"`, message + optional "Try again". |
| `EmptyState` | Emoji + title + hint + optional action. Every feature has a crafted empty state. |
| `Markdown` | Dependency-free renderer for AI narration (headings/lists/bold/italic). Builds React text nodes only — HTML in model output renders inert. |
| `PageHeader` | Kicker ("Feature 0N — …") + display title + lede. Identical rhythm on all 7 pages. |
| `DestinationField` | The shared destination input bound to the cross-feature context. |

## Interaction & Motion

- `animate-fade-up` (0.5s ease-out) on page mount and result cards; `shimmer` on skeletons; blinking ember cursor during story streaming.
- All motion collapses under `prefers-reduced-motion: reduce` (global CSS).
- Hover states change border/text color only — no layout shift.

## Accessibility Checklist (implemented)

- Skip link → `#main`; single `h1` per page; landmark structure (`nav`, `main`, `footer`, labeled `section`s).
- Visible `:focus-visible` ring (2px ember) on every interactive element.
- Forms: real `<label for>` on every control (via `useId`), `fieldset/legend` for chip groups.
- ARIA where semantics need help: era tabs (`role=tablist/tab aria-selected`), persona picker (`radiogroup/radio`), chat log (`role=log aria-live=polite`), loading (`role=status`), errors (`role=alert`), streaming article (`aria-busy`).
- Emojis are decorative: `aria-hidden="true"` throughout.
- Mobile: nav collapses to an accessible disclosure (`aria-expanded`/`aria-controls`); grids collapse to one column; date inputs use `[color-scheme:dark]`.
