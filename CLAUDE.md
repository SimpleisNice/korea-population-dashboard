# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # build-data, then start dev server at http://localhost:3000
npm run build      # build-data, then production build
npm run build-data # Convert data/raw/*.csv into public/data/regions/*.json (also runs automatically before dev/build)
npm run lint       # ESLint
npm run test       # Run Vitest tests (also: npx vitest run)
```

Note: there are currently no test files in the repo (`npx vitest run` reports "No test files found"). If you add tests for the data pipeline, prefer covering `scripts/csv-to-json.ts` and `src/lib/data.ts` first — see docs/spec.md § 4.

## What This Is

A server-rendered mobile dashboard for Korean residential population statistics sourced from MOIS (Ministry of Interior and Safety), aimed at real-estate/relocation decision-making — see `docs/domain.md` for the full domain definition. There are no external API calls at runtime; all population data is pre-built JSON read from disk per request.

## Data Flow

1. Raw monthly MOIS CSV files live in `data/raw/` (two shapes: `*_registered_population_and_household_monthly.csv` and `*_population_by_age_monthly.csv`), manually added when new data is published
2. `scripts/csv-to-json.ts` (run via `npm run build-data`, wired into `dev`/`build`) parses those CSVs and writes one JSON file per region to `public/data/regions/{code}.json`, plus an `index.json` of all regions
3. `src/lib/data.ts` reads these JSON files from disk per request (only `index.json` is cached in memory across requests) and exposes aggregation functions (`getRegionDetail`, `getAllRegionRankings`, `getSidoStats`, etc.)
4. Data-driven pages (`ranking`, `compare`, `[sido]/[sigungu]`, `[sido]/[sigungu]/detail`) are async Server Components that `await props.searchParams` (Next.js 16 pattern) and call `src/lib/data.ts` functions directly — no data API routes. The one API route that does exist, `src/app/api/og/route.tsx`, generates OG share images, not data.
5. All filter state (month, sort, selected regions, comparison range) lives in URL query params via the `nuqs` library / Next.js searchParams, making links shareable and back/forward functional

## CSV Parsing Quirks

This only matters when editing `scripts/csv-to-json.ts` — it runs at build/dev time, never at request time. The two CSV shapes have different header depths:
- Population/household CSV: row 1 metadata, row 2 month headers (repeated across columns), row 3 column-type headers, row 4+ data
- Age-breakdown CSV: same first 3 rows, but data starts at **row 5** (one extra header row)

`splitCSVLine()` handles quoted commas in Korean number strings (e.g. `"1,234,567"`), and `parseNum()` strips those commas. `LEGACY_CODE_MAP` merges pre/post administrative-boundary-change region codes (Gangwon 42xx→51xx in 2023.06, Jeonbuk 45xx→52xx in 2024.01) so time series stay continuous. There are no automated tests for this yet (see Commands above).

## Region Code Hierarchy

Regions use 10-digit MOIS codes. Top-level 시도 (17 provinces) have codes ending in `00000000` and are filtered out by `scripts/csv-to-json.ts` (only 시군구 rows are kept). Sub-regions share the same 2-digit sido prefix.

## Key Architecture Decisions

- **No data API routes** — data aggregation runs server-side in page components via direct `fs` reads in `src/lib/data.ts`; the only API route (`api/og`) is for OG image generation
- **URL state via `nuqs` / searchParams** — not React state or Context; filters survive refresh and are shareable
- **Light, mobile-only UI** — no dark mode, no desktop layout by design (see `src/app/globals.css` `@theme` tokens). Max content width is 430px (`--max-w`) via `MobileShell`; there is no separate desktop component tree
- **Bottom nav, not sidebar** — `BottomNav` (`src/components/layout/BottomNav.tsx`) provides 4 tabs: 홈 / 지도 / 순위 (트렌딩 포함) / 비교
- **AdSense is live** — `src/components/AdSlot.tsx` pushes to `window.adsbygoogle` on mount; the publisher ID (`ca-pub-4466379680692265`) is a real, approved ID hardcoded in the component and in `src/app/layout.tsx` and `public/ads.txt`. Only the per-slot ID (`NEXT_PUBLIC_ADSENSE_SLOT_BANNER`) is env-configured

## Docs

`docs/spec.md` is the living feature spec (pages, components, data functions) — update it when shipping a user-facing feature. `docs/domain.md` defines the product domain and scope boundaries — consult it before proposing new feature areas.

## Path Aliases

`@/*` maps to `./src/*` (defined in `tsconfig.json` and mirrored in `vitest.config.mjs`).
