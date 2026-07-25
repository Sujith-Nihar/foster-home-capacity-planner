# Performance architecture

This document describes how the Foster Home Capacity Planner keeps analytical pages responsive while serving a **fixed reporting snapshot** through **July 1, 2026**. It is written for developers and reviewers evaluating the assessment build.

## Design goals

- Serve stable read models quickly without changing metric definitions or UI behavior.
- Keep provider filtering, sorting, and pagination on the server.
- Avoid duplicate Supabase round-trips within a request.
- Make performance observable in development and production when needed.
- Degrade safely when optional database migrations have not yet been applied.

## Fixed snapshot model

All analytical values use `REPORTING_DATE = 2026-07-01` from `src/config/metrics.ts`. The application does not call `new Date()` for metrics.

Because the dataset is frozen for this build, stable aggregate reads are wrapped in Next.js `unstable_cache` in `src/lib/data/cached-snapshot.ts` with a one-year revalidation window. Cached helpers include:

- System snapshot and monthly metrics
- County recruitment ranking and largest-county lists
- Shared county-age metrics (used by recruitment, overview, and county detail)
- Per-county metrics for detail pages (`getCachedCountyMetricsByName`)
- Filter options and retention summary counts
- Provider activity timelines per provider ID

Filtered table pages (`/recruitment`, `/retention`) remain dynamic and are not fully page-cached.

## Reporting date lookups

`getActiveReportingDate()` in `src/lib/supabase/server.ts` is wrapped in React `cache()` and returns the fixed `REPORTING_DATE` constant. This removes repeated `dataset_metadata` lookups that previously ran on every page request.

## Recruitment query deduplication

`/recruitment` previously loaded `county_age_metrics` more than once per request (ranking pressure and full county-age table). Recruitment page assembly now loads county-age metrics once through `getCachedCountyAgeMetrics()` and derives age-group pressure from that shared result in `src/lib/data/recruitment.ts`.

## Parallel page-data fetching

Independent server operations are fetched with `Promise.all` in page data loaders:

| Route | Loader | Parallel work |
| --- | --- | --- |
| `/` | `getOverviewPageData()` | Snapshot, monthly metrics, rankings, retention summary |
| `/recruitment` | `getRecruitmentPageData()` | County list, filter options, shared county-age metrics |
| `/retention` | `getRetentionPageData()` | Paginated providers, cached filter options, cached summary KPIs |
| `/recruitment/[county]` | `getCountyPageData()` | Cached county row, cached county-age metrics, county retention preview |
| `/providers/[providerId]` | `getProviderPageData()` | Provider row, cached activity timeline, cached county context (parallel) |

## County and provider detail loaders

County detail pages load three independent datasets in parallel:

1. **County metric lookup** — cached per county via `getCachedCountyMetricsByName()`
2. **County age-group lookup** — shared cached `getCachedCountyAgeMetrics()` with in-memory county filter
3. **County retention summary lookup** — paginated provider preview for the county table

Provider detail pages fetch the provider row first, then load activity timeline and county context in parallel. Activity periods are cached per provider ID for the fixed reporting snapshot.

Structured timing operations:

| Route | Operations logged |
| --- | --- |
| `/recruitment/[county]` | `getCountyDetailPageData`, `county metric lookup`, `county age-group lookup`, `county retention summary lookup` |
| `/providers/[providerId]` | `getProviderDetailPageData`, `provider metric lookup`, `provider activity timeline lookup`, `provider county-context lookup` |

## Loading boundaries and prefetch strategy

Dynamic detail routes include restrained loading shells:

- `src/app/(dashboard)/recruitment/[county]/loading.tsx`
- `src/app/(dashboard)/providers/[providerId]/loading.tsx`

Shells show breadcrumb, title, metric, and section placeholders with `motion-safe:animate-pulse` (disabled under `prefers-reduced-motion`).

**Prefetch strategy:** rely on default Next.js `<Link>` prefetch for visible table actions. No bulk prefetch of all county or provider routes. Loading boundaries allow route shells to stream while Supabase queries resolve.

## Static generation decision

`generateStaticParams` for all ~102 counties was **not implemented** because county detail pages accept search parameters for the embedded retention provider table (pagination, sort, filters). Pre-generating every provider route was also rejected to avoid large build artifacts (~3,000+ pages).

The fixed snapshot instead uses long-lived `unstable_cache` helpers keyed by reporting date, county, and provider ID.

## Favicon and browser metadata

| File | Size | Purpose |
| --- | --- | --- |
| `src/app/icon.png` | 512×512 | App icon / manifest |
| `src/app/apple-icon.png` | 180×180 | Apple touch icon |
| `src/app/favicon.ico` | 16/32/48 | Browser tab icon |

Source: cropped `fi` magnifying-glass symbol from `public/brand/foster-insights-logo.webp` via `scripts/generate-favicon.py` (~12% transparent padding).

The previous black triangle came from the default `src/app/favicon.ico` shipped with the Next.js starter template.

### Verifying favicon changes

Browsers cache favicons aggressively. After regenerating icons:

```bash
rm -rf .next
npm run build
npm run start
```

Then open the site in a **new incognito window** or clear site data before checking the tab icon.

Default document title: `Foster Home Capacity Planner | Foster Insights`.

## Production route benchmark

## Retention sorting and pagination

Retention provider lists are filtered, sorted, and paginated in Supabase. The default sort by outreach priority uses a generated `outreach_priority_rank` column (High → Medium → Low) added in:

`supabase/migrations/20260724150000_add_provider_outreach_priority_rank.sql`

Supporting indexes:

- `provider_metrics_reporting_priority_rank_idx` on `(reporting_date, outreach_priority_rank, provider_id)`
- `county_age_metrics_reporting_date_idx` on `(reporting_date)`
- `county_metrics_reporting_date_idx` on `(reporting_date)`

### Safe fallback before migration

If the ranked query fails because `outreach_priority_rank` is not yet present, `src/lib/data/retention.ts` falls back to loading the filtered provider set and applying in-memory priority sorting before slicing the current page. Behavior stays correct; latency is higher until the migration is applied.

Apply migrations with:

```bash
npx supabase db push
```

## Structured performance logging

Server operations can emit JSON timing logs through `src/lib/performance/timing.ts`.

Logging is enabled when:

- `NODE_ENV=development`, or
- `PERFORMANCE_LOGGING_ENABLED=true`

Each log entry includes route, operation name, duration in milliseconds, optional row count, success flag, and cache status.

Route labels are set at the page layer via `setPerformanceRoute()` in dashboard route files.

Example:

```json
{"route":"/retention","operation":"listRetentionProviders","duration_ms":118,"row_count":25,"success":true,"cache":"miss"}
```

## Production route benchmark

Measure cold and warm HTML response times against a running **production** server:

```bash
npm run build
npm run start
# separate terminal
npm run benchmark:routes
```

Optional environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BENCHMARK_BASE_URL` | `http://127.0.0.1:3000` | Target origin |
| `BENCHMARK_REQUESTS` | `3` | Requests per route |

The script issues three requests per route. The first request is treated as **cold**; the average of the next two is **warm**.

Route samples are configured in `scripts/benchmark-routes.config.mjs`:

- Core: `/`, `/recruitment`, `/retention`, `/methodology`
- Counties: `Cook`, `Champaign`, `DeKalb`, `Alexander` (limited-data sample)
- Providers: active `500001`, inactive `500021`, multi-reason `500024`
- Not found: invalid county and provider routes

### Representative local production run (July 25, 2026)

Captured against `npm run start` with local Supabase credentials. Timings vary with network latency and process warmth.

| Route | Cold (ms) | Warm avg (ms) |
| --- | ---: | ---: |
| `/` | 49 | 20 |
| `/recruitment` | 388 | 222 |
| `/retention` | 177 | 118 |
| `/methodology` | 11 | 11 |
| `/recruitment/Cook` | 119 | 96 |
| `/recruitment/Champaign` | 114 | 91 |
| `/recruitment/DeKalb` | 109 | 97 |
| `/recruitment/Alexander` (limited data) | 112 | 212 |
| `/providers/500001` (active) | 97 | 258 |
| `/providers/500021` (inactive) | 97 | 109 |
| `/providers/500024` (multi-reason) | 87 | 130 |

**Slowest county server operation (warm):** `county retention summary lookup` (~76–170 ms) — paginated provider preview for the embedded retention table.

**Slowest provider server operation (warm):** `provider metric lookup` (~72–133 ms) — single-row `provider_metrics` fetch; county context and activity timeline are cached hits after warm-up.

**Notes:**

- Warm `/recruitment` is typically ~230–250 ms in this environment.
- Warm `/retention` is much faster after `outreach_priority_rank` is applied (~130 ms warm in the run above). Before that migration, the in-memory fallback for priority sorting was observed around **400 ms+** warm on the same dataset.
- Do not treat a single benchmark run as a service-level guarantee. Re-run `npm run benchmark:routes` after infrastructure or query changes.

## What was intentionally not changed

Performance work did not alter:

- ETL calculations or processed outputs
- Supabase query semantics exposed to the UI
- Recruitment or retention priority rules
- Filter, sort, pagination, or export behavior visible to staff
- Client UI design or Playwright expectations

## Related files

| Area | Location |
| --- | --- |
| Snapshot caching | `src/lib/data/cached-snapshot.ts` |
| Timing utilities | `src/lib/performance/timing.ts` |
| Recruitment loader | `src/lib/data/recruitment.ts` |
| Retention loader | `src/lib/data/retention.ts` |
| Overview loader | `src/lib/data/overview.ts` |
| Priority-rank migration | `supabase/migrations/20260724150000_add_provider_outreach_priority_rank.sql` |
| Benchmark script | `scripts/benchmark-production-routes.mjs` |
| Benchmark route config | `scripts/benchmark-routes.config.mjs` |
| Favicon generator | `scripts/generate-favicon.py` |
| Web manifest | `src/app/manifest.ts` |
