# Architecture and product decisions

This document records major tradeoffs for the Foster Home Capacity Planner assessment build.

## Monorepo with local ETL instead of in-app processing

**Decision:** Process raw CSVs locally with Python/Pandas, then publish only aggregated read models to Supabase.

**Why:** Child-level records must not reach the browser. Interval merging, eligibility rules, and priority classification need repeatable, testable batch logic. Supabase should serve query-ready tables, not raw events.

**Tradeoff:** Data refresh requires a manual or scheduled ETL run plus loader step. The web app is not a live operational data pipeline.

## Next.js App Router without a separate API backend

**Decision:** Use Server Components and Route Handlers inside Next.js; no Express/FastAPI service.

**Why:** The product is read-heavy decision support with a small export surface. A separate backend would add deployment and security surface without solving a core requirement.

**Tradeoff:** Long-running or queue-based workloads are out of scope for this build.

## Supabase publishable key only in the deployed app

**Decision:** The browser-facing application uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` only. The service-role key is restricted to the local loader script.

**Why:** Anonymous read-only access is acceptable for the assessment snapshot, and minimizing secret exposure reduces deployment risk.

**Tradeoff:** All public data must be safe to expose under RLS. Write paths and admin operations are intentionally excluded.

## URL search parameters as filter state

**Decision:** Recruitment and retention filters, sort order, and pagination live in the URL.

**Why:** Staff can bookmark, share, and export the same filtered view. Server rendering can hydrate directly from query parameters.

**Tradeoff:** URLs can become long with many filters. The UI resets page index when filters change to keep results coherent.

## Database-side outreach priority sorting

**Decision:** Retention providers sorted by outreach priority use a generated `outreach_priority_rank` column and supporting index in PostgreSQL. If that migration is missing, the app falls back to in-memory priority ordering over the filtered result set before pagination.

**Why:** Database lexical ordering of `outreach_priority` text does not match business priority order (High → Medium → Low). A stored rank enables indexed, paginated sorting without loading all providers into memory.

**Tradeoff:** Deployments must apply `20260724150000_add_provider_outreach_priority_rank.sql`. Until then, priority sorting remains correct but slower on large filtered sets.

See [`docs/PERFORMANCE.md`](PERFORMANCE.md).

## Limited-data county partition

**Decision:** Counties below minimum foster-home child and active-provider thresholds are labeled `Limited data` and excluded from comparative scatter ranking.

**Why:** Small counties produce unstable ratios that are easy to misread as statewide recruitment pressure.

**Tradeoff:** Some counties remain visible but are not directly comparable to eligible peers.

## Rule-based priorities, not predictive scores

**Decision:** Recruitment and retention outputs use transparent thresholds and readable reason tags. The UI never presents risk scores, closure predictions, or vacancy counts.

**Why:** Staff need explainable decision support aligned with the project specification and public-sector trust requirements.

**Tradeoff:** The product does not estimate future placement success or provider exit probability.

## Chart text summaries in addition to visuals

**Decision:** Every chart includes a plain-language summary and an accessible name via `aria-labelledby`.

**Why:** Charts alone are insufficient for screen-reader users and for staff who need a quick textual interpretation.

**Tradeoff:** Summary text must be maintained alongside chart logic when metrics change.

## CSV exports via Route Handlers

**Decision:** Exports are implemented as `GET /api/exports/*` Route Handlers that reuse the same server query layer as the UI.

**Why:** Keeps export filters identical to on-screen results and avoids client-side extraction of large tables.

**Tradeoff:** Exports are capped at 5,000 rows to protect memory and response size.

## Privacy-first published schema

**Decision:** Supabase tables exclude `id_child` and child-level histories. Provider activity is published as merged periods only.

**Why:** The assessment explicitly forbids publishing child identifiers or child-level placement episodes.

**Tradeoff:** Analyses that require child-level drill-down are intentionally out of scope.

## No authentication in the assessment build

**Decision:** Ship a read-only public snapshot with `noindex, nofollow`.

**Why:** The take-home scope focuses on analytical correctness, privacy, and UX quality rather than identity management.

**Tradeoff:** Production deployment would require staff authentication, authorization, and audit trails before real operational use.

## Fixed reporting date

**Decision:** All metrics use `REPORTING_DATE = 2026-07-01`; the UI does not call `new Date()` for analytical values.

**Why:** A frozen snapshot makes tests deterministic and prevents accidental drift between environments.

**Tradeoff:** The app does not answer “as of today” without rerunning ETL and redeploying data.
