# CoinRip 🪙

> Flip packs. Build your vault. Climb the leaderboard.

A crypto coin collecting game built with React + Supabase, live at **[coinflip.city](https://coinflip.city)**.

---

## What is CoinRip?

CoinRip is a pack-flipping collectible game. Spend in-game coins to open packs and pull crypto coins across 5 rarity tiers — from common **SPARK** all the way up to the ultra-rare **SINGULARITY**. Track your collection, compete on the global leaderboard, and flex your vault.

### Features

- 🎴 **Pack Flipping** — open packs to pull collectible crypto coins
- 🆓 **Free Daily Flip** — one free pack every 24 hours
- 🏆 **Leaderboard** — global ranking by total flips
- 🗄️ **Vault / Collection** — track every coin you own across all 5 tiers
- 👤 **Profile** — stats, achievements, recent pulls, and rank badge
- 🔐 **Passwordless Auth** — sign in with a magic link sent to your email
- ✏️ **Custom Username** — pick your display name shown on the leaderboard

### Rarity Tiers

| Tier | Color |
|---|---|
| SPARK | ⬜ Common |
| FLARE | 🟠 Uncommon |
| NOVA | 🔵 Rare |
| PULSAR | 🟣 Epic |
| SINGULARITY | 🟡 Ultra Rare |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite (static site) |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Routing | Wouter |
| Auth | Supabase (magic link email) |
| Database | Supabase (PostgreSQL + RLS) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |
| Language | TypeScript |

**No backend server** — all game logic runs client-side. Persistence goes directly to Supabase via the public anon key, secured by Row Level Security policies.

---

## Project Structure

```
artifacts/coinrip/src/
├── hooks/
│   ├── use-auth.ts          # Auth context (login, setDisplayName, needsDisplayName)
│   └── use-game-state.ts    # Game state context (balance, flips, collection)
├── lib/
│   ├── api-client.ts        # All Supabase queries
│   ├── dataset.ts           # Coin & pack definitions (source of truth)
│   └── supabase.ts          # Supabase client init
├── components/
│   ├── auth/
│   │   ├── LoginModal.tsx         # Magic link sign-in
│   │   └── UsernameSetupModal.tsx # First-time setup + change username
│   └── layout/
│       └── Layout.tsx       # App shell + bottom nav
└── pages/
    ├── Home.tsx             # Pack selection
    ├── Leaderboard.tsx      # Global leaderboard
    ├── Profile.tsx          # User profile & achievements
    └── Collection.tsx       # Full vault browser
```

---

## Database Schema

```sql
CREATE TABLE game_states (
  user_id                   uuid PRIMARY KEY REFERENCES auth.users,
  username                  text,
  coin_balance              integer DEFAULT 500,
  total_flips               integer DEFAULT 0,
  last_free_daily_timestamp bigint,
  collection                jsonb DEFAULT '[]',
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);
```

**RLS policies:**
- `anon` — can SELECT all rows (leaderboard)
- `authenticated` — can INSERT/UPDATE only their own row (`auth.uid() = user_id`)

---

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that:
1. Installs dependencies with `pnpm`
2. Builds the Vite app (injects `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` from secrets)
3. Deploys to the `gh-pages` branch
4. Live at `coinflip.city` via CNAME

---

## Environment Variables

Set these as GitHub Actions secrets:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

---

## License

MIT
