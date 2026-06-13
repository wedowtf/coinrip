# CoinRip

A mobile-first "pack opening" game where users rip open digital packs to reveal collectible "coins" representing real startup projects from the Orynth ecosystem.

## Run & Operate

- `pnpm --filter @workspace/coinrip run dev` — run CoinRip frontend (Vite, uses PORT env)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: none for frontend (all localStorage); `DATABASE_URL` for API server if used

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion + wouter
- Fonts: Bricolage Grotesque (headings), Space Grotesk (body) via Google Fonts
- State: localStorage only — no backend for game data
- API: Express 5 (existing scaffold, unused by CoinRip MVP)
- Build: Vite static build

## Where things live

- `artifacts/coinrip/` — CoinRip React+Vite frontend (the main product)
- `artifacts/coinrip/src/lib/dataset.ts` — coin data + tier logic + weighted random draw
- `artifacts/coinrip/src/hooks/use-game-state.ts` — all game state via localStorage
- `artifacts/coinrip/src/pages/` — Home, Rip, Collection pages
- `artifacts/coinrip/src/components/layout/Layout.tsx` — top nav + bottom nav
- `artifacts/coinrip/src/components/ui/Logo.tsx` — custom CoinRip SVG logo
- `artifacts/coinrip/src/index.css` — dark theme (#0A0A0F) + tier color variables + animations
- `lib/api-spec/openapi.yaml` — API contract (unused by CoinRip MVP)
- `artifacts/api-server/` — Express API server (scaffold, not used by CoinRip MVP)

## Architecture decisions

- **Frontend-only / localStorage**: CoinRip is a fully static app — no backend required for MVP. All user state (collection, coin balance, last rip timestamp, username) is stored in localStorage keyed by username.
- **Tier system ("Cosmic Intensity")**: Coin tier is computed from marketCap at runtime — SPARK (<$7K), FLARE ($7K–$10K), NOVA ($10K–$20K), PULSAR ($20K–$100K), SINGULARITY (>$100K).
- **Weighted random draw**: Spark 45%, Flare 30%, Nova 15%, Pulsar 8%, Singularity 2% — computed in `dataset.ts`.
- **Dark-only UI**: The app is dark-mode only (#0A0A0F background). No light mode toggle needed.
- **Mock auth**: Username-only modal (no password/OAuth). Structured so a real auth provider can swap in later.

## Product

- Home/Packs: hero with animated pack, horizontally scrollable pack cards, login gate
- Rip screen: shake → tear → flip/zoom reveal with tier-specific glow + particles
- Collection: grid of owned coins grouped by tier, quantity badges, disabled Redeem buttons
- Login modal: username-based mock auth, coin balance in navbar
- Bottom nav: Packs, Collection, Login/Profile

## Coin Dataset

20 Orynth ecosystem projects hardcoded in `src/lib/dataset.ts`. Logo URLs are placeholders — replace with real icons from orynth.dev once available.

## User preferences

- GitHub repo: https://github.com/wedowtf/coinrip
- Deploy target: GitHub Pages (static build via `pnpm --filter @workspace/coinrip run build`)

## Gotchas

- Google Fonts `@import url(...)` MUST be the very first line in `index.css` — PostCSS silently breaks if any other `@import` precedes it.
- The `artifacts/coinrip/vite.config.ts` requires `PORT` and `BASE_PATH` env vars at dev/build time — set by the workflow automatically.
- Adding real coin logos: replace placeholder SVGs in `dataset.ts` with actual `logoUrl` values scraped from orynth.dev.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
