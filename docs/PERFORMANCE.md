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
- Shared county-age metrics (used by recruitment and overview)
- Filter options and retention summary counts

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

This reduces wall-clock latency compared with sequential awaits.

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

The script issues three requests per route. The first request is treated as **cold**; the average of the next two is **warm**.

Routes measured: `/`, `/recruitment`, `/retention`, `/methodology`.

### Representative local production run

The table below was captured on **July 24, 2026** against `npm run start` on this repository with Supabase credentials configured locally. Timings vary with network latency to Supabase, process cold start, and whether `outreach_priority_rank` is present.

| Route | Cold (ms) | Warm avg (ms) |
| --- | ---: | ---: |
| `/` | 245 | 29 |
| `/recruitment` | 605 | 236 |
| `/retention` | 157 | 134 |
| `/methodology` | 20 | 12 |

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
