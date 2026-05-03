# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Run Vitest tests (also: npx vitest run)
npx vitest run src/lib/csv-parser.test.ts  # Run a single test file
```

## What This Is

A server-rendered dashboard for Korean residential population statistics sourced from MOIS (Ministry of Interior and Safety). All data is static CSV files in `/public/data/` — there are no external API calls at runtime.

## Data Flow

1. Monthly MOIS CSV files live in `/public/data/` (one file per 12-month period, manually updated)
2. On each request, `src/lib/data.ts` parses and aggregates the CSVs via `loadAllRecords()`, which caches parsed records in memory per server instance
3. The main page (`src/app/page.tsx`) is an async Server Component — it awaits `props.searchParams` (Next.js 16 pattern) and calls data functions directly (no API routes)
4. All filter state (year, month, region, subregion) lives in URL query params via the `nuqs` library, making links shareable and back/forward functional

## CSV Parsing Quirks

MOIS CSVs have an unconventional multi-header structure:
- Row 1: metadata (skipped)
- Row 2: month headers, repeated across columns
- Row 3: column type headers (총인구수, 세대수, etc.)
- Row 4+: data rows

Each month occupies 6 columns. `splitCSVLine()` handles quoted commas in Korean number strings (e.g. `"1,234,567"`), and `parseKoreanNumber()` strips those commas. Tests in `src/lib/csv-parser.test.ts` cover the edge cases — run them when touching the parser.

## Region Code Hierarchy

Regions use 10-digit MOIS codes. Top-level 시도 (17 provinces) have codes ending in `00000000`. Sub-regions (시군구) share the same 2-digit prefix but don't end in 8 zeros. This pattern drives the drill-down logic in `getSubRegionSummaries()`.

## Key Architecture Decisions

- **No API routes** — data aggregation runs server-side in the page component
- **URL state via `nuqs`** — not React state or Context; filters survive refresh and are shareable
- **Glassmorphism dark-only UI** — Material Design 3 color tokens as CSS variables, `glass-panel` utility class with backdrop-filter, dark mode applied via `dark` class on `<html>`; never remove this class or add a light mode toggle
- **Responsive split** — Desktop (`hidden md:block`) uses Sidebar + full chart layout; mobile (`md:hidden`) uses MobileHeader with a drawer and stacked charts; these are separate component trees
- **AdSense** — `src/components/AdSense.tsx` uses IntersectionObserver to defer ad loading until visible; all IDs are currently placeholders (`ca-pub-0000000000000000`)

## Path Aliases

`@/*` maps to `./src/*` (defined in `tsconfig.json` and mirrored in `vitest.config.mjs`).
