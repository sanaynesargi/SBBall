# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

SBBall is a basketball stat-tracking app for pickup games. As of the 2026 migration it is a **single Next.js 14 app deployed on Vercel**, with the API as App Router route handlers backed by **Neon Postgres**.

- `sbball-ui/` — the live app: Next.js 14 App Router + Chakra UI frontend **and** the `/api/*` route handlers (Neon Postgres).
- `sbball-server/` — **DEPRECATED** legacy Express + SQLite server (port 8080). Retired by the migration; kept only for reference. Do not deploy it; new backend work goes in `sbball-ui/src/app/api/*`. It can be deleted once the Vercel/Neon deploy is confirmed.

## Commands (run from `sbball-ui/`)
```bash
npm install
npm run dev        # next dev (http://localhost:3000; falls back to 3001 if taken)
npm run build      # next build (also typechecks + statically renders pages)
npm start          # next start
npm run lint       # next lint
npm run db:migrate # node --env-file=.env.local scripts/migrate-to-neon.mjs
```
There is **no test suite**. Validate changes with `npm run build` (it runs `tsc` and renders every page).

### Database setup / data migration
1. Provision Neon via the **Vercel Marketplace** (injects `DATABASE_URL`).
2. `vercel env pull .env.local` (needs `vercel link` to the project first).
3. `npm run db:migrate` — applies `db/schema.sql`, truncates, imports `db/seed/*.json` (the committed SQLite snapshot) preserving ids, and bumps identity sequences. Idempotent.

## Architecture

### API: Next.js route handlers + Neon
Each endpoint is a folder under `sbball-ui/src/app/api/<name>/route.ts` (e.g. `getPlayers`, `endGame`, `getPlayerAverages`, `getBoxScore(s)`, `gameFeed`, `addAwards`, player CRUD). All are `export const dynamic = "force-dynamic"`.
- DB access: `src/lib/db.ts` — lazy `getSql()` / `query(text, params)` over `@neondatabase/serverless`. **Lazy by design** (top-level `neon()` would crash `next build` before env is set); never wrap the client in a Proxy.
- `src/lib/performanceRating.ts` — `calculateRating()` (ported verbatim; weights/bonuses documented in README.md).
- `src/lib/statHelpers.ts` — shared SQL fragment (`aggregateStatColumns`), `getTodayDate`, impressive-index helpers.

### Postgres-port gotchas (carry forward in any new SQL)
SQLite → Postgres introduced three rules the schema and queries depend on:
1. **Quoted camelCase identifiers.** The frontend reads camelCase keys straight off `SELECT *` (`playerName`, `twosAttempted`, `snapshotPts`, `"desc"`, …). Postgres lowercases unquoted identifiers, so these columns are double-quoted everywhere (`db/schema.sql` and all queries). Lowercase columns (`ast`, `twos`, `rating`, …) need no quotes.
2. **`::float8` casts on aggregates.** Neon returns `numeric`/`bigint` as **strings**; the frontend does math on them. Every `AVG`/`SUM`/computed numeric is cast `::float8` to come back as a JS number.
3. **`NULLIF(denominator, 0)`** on percentage divisions — Postgres errors on divide-by-zero where SQLite returned NULL.

`endGame` uses `INSERT ... RETURNING id` (replaced the old race-prone insert-then-`SELECT max(id)`).

### Game-mode branching is the core domain concept (and pervasive)
"Regular season / 2v2" vs "Playoff / 4v4" forks data and logic throughout:
- `mode == "2v2"` → `playerCount = 2`, the **`stats`** table, **no free throws**, rating includes efficiency metrics (turnover penalty, FG%/3P%).
- `mode == "4v4"` → `playerCount = 4`, the **`playoff_stats`** table (extra `fts` column), rating excludes efficiency metrics.

Check both branches when touching stats queries or rating logic. There are also two play-by-play tables, `game_feed` (playoffs) and `game_feed2` (regular).

### Frontend
- App Router pages under `sbball-ui/src/app/`: `/` (live game tracker, the largest), `main/` (league leaders), `create/` (roster/game log/box scores), `gameView/`, `playerInfo/`, `admin/` (dev-only). Pages are `"use client"` and call the **same-origin** `/api/*` via `axios`.
- `utils/apiUrl.tsx` exports `apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ""` — **empty string = same origin**. Do NOT set `NEXT_PUBLIC_API_URL` in Vercel (a leftover Railway URL there would send traffic off-app).
- Reusable components in `sbball-ui/components/` (sibling of `src/`, not inside it). Shared types in `sbball-ui/types/`.

### Design system ("Sleek dark courtside")
- Theme: `src/lib/theme.ts` (Chakra `extendTheme`). Dark-only; deep charcoal/teal base with an electric mint accent. Use **semantic tokens** (`bg.app|surface|card|hover`, `border.subtle`, `text.primary|muted|faint`, `accent.500/400/fg`, `team1.500`, `team2.500`, `pos/neg/warn.500`) and radii tokens (`card`, `tile`) — do not hard-code hex.
- Fonts via `next/font` in `layout.tsx`: Inter (`--font-body`) + Archivo (`--font-display`, used for headings/stat numbers). The root `layout.tsx` is a **Server Component — keep Chakra imports out of it** (importing `@chakra-ui/react` there breaks the build with `createContext is not a function`); color mode is handled by the client `providers.tsx`.
- Responsive shell: `components/Layout.tsx` — sticky top bar with desktop nav + a mobile bottom tab bar; content constrained to the `shell` size token. Pass `size` to widen (the live tracker uses a wider value for 4v4).

## Deployment
- Everything deploys to **Vercel** with **Root Directory = `sbball-ui`**. The legacy Railway/Express path and `DEPLOYMENT.md` are obsolete.
- Required env: `DATABASE_URL` (from the Neon Marketplace integration). Run `npm run db:migrate` once against Neon to seed.
