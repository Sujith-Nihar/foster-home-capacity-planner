# Foster Home Capacity Planner — Architecture and Product Plan

## 1. Architecture decision

Use a **read-optimized, privacy-conscious monorepo**:

```text
Local source CSVs
        │
        ▼
Python/Pandas ETL + validation
        │
        ├─ Normalize documented county variants
        ├─ Validate keys, dates, row counts and relationships
        ├─ Merge overlapping provider placement intervals
        ├─ Derive recruitment metrics
        ├─ Derive retention metrics
        └─ Remove child-level identifiers
        │
        ▼
Versioned processed datasets
        │
        ▼
Supabase PostgreSQL read models
        │
        ▼
Next.js App Router
        │
        ├─ Server Components for page data
        ├─ Client Components for filters/charts only
        ├─ Server-side filtering, sorting and pagination
        └─ Route Handler only for CSV export
        │
        ▼
Vercel
```

This is production-oriented without adding unnecessary services.

## 2. Why this architecture

### Next.js instead of React plus a separate backend

The application is primarily a read-only decision-support product. Next.js provides:

- React UI
- Server-rendered data access
- Dynamic routes
- Loading and error boundaries
- CSV Route Handlers
- Straightforward Vercel deployment

A separate FastAPI or Express service would add deployment, security and maintenance overhead without solving a real requirement.

### Local ETL instead of processing data in the browser

All analytical logic belongs in a repeatable ETL process because:

- Placement intervals overlap and must be merged.
- Current and historical concepts have a fixed reporting date.
- Child-level data should not reach the browser.
- Metrics should be tested once and reused consistently.
- Supabase should serve small, query-ready tables rather than raw events.

### Supabase as the read model

Supabase is used for:

- PostgreSQL storage
- Indexed filtering and sorting
- Read-only Row Level Security
- Simple integration with Next.js
- Reproducible SQL migrations

Only processed tables are uploaded. Raw child and placement files remain local.

## 3. Source-data facts and corrections

The actual source files contain:

- 6,063 providers
- 16,139 children
- 51,994 placements

The source data confirms:

- Fixed reporting date: `2026-07-01`
- Current children: `discharge_date` is null
- Every current child’s latest placement ends on `2026-07-01`
- Placement durations are end-exclusive:
  `placement_end_date - placement_start_date`
- All 6,063 providers have at least one foster-home placement
- Foster-home provider IDs all match the provider table
- Kin placements have no provider ID
- Nonfamily provider IDs do not belong to the foster-provider table
- `n_days_active` equals the union of provider placement intervals
- Provider preferences are current preferences and must not be used to judge historical placements

### Narrow normalization required

The source contains two county-label variants that would distort joins:

```text
Vermillion → Vermilion
De Witt → DeWitt
```

Implement an explicit, documented map. Preserve the original value only in local validation logs; all published metrics use the normalized value.

### Missing ages

A small number of child records have missing ages. Current children with missing age must:

- Remain included in total county demand
- Be assigned to an `Unknown` age group
- Be excluded only from age-specific ratio denominators
- Never be silently dropped

## 4. Security model

### Assessment deployment

The review site must be easy to access, so:

- No login
- Only deidentified and aggregate data is stored online
- Provider IDs remain pseudonymous numeric IDs
- Raw child data is never uploaded
- Public tables have anonymous `SELECT` only
- No anonymous writes
- The site is marked `noindex, nofollow`

### Real DCFS production extension

A real deployment would add:

- Entra ID or agency SSO
- Role-based access
- Audit logs
- Private provider records
- Environment-specific RLS
- Approved hosting and data-governance controls

The assessment README should clearly separate the review deployment from the production extension.

## 5. Database design

Use a small metadata table plus six read models.

### `dataset_metadata`

One row for the active dataset:

```text
dataset_version
reporting_date
generated_at
source_hash
etl_version
provider_count
child_count
placement_count
```

### `system_snapshot`

One statewide row:

```text
reporting_date
current_children_in_care
current_foster_home_children
current_kin_children
current_nonfamily_children
currently_licensed_providers
currently_active_providers
high_recruitment_counties
high_retention_providers
```

### `county_metrics`

```text
county
reporting_date
current_children_in_care
current_foster_home_children
current_kin_children
current_nonfamily_children
licensed_providers
active_providers
inactive_providers
children_per_active_provider
out_of_county_foster_count
out_of_county_foster_rate
expiring_90_days
expiring_180_days
high_retention_providers
medium_retention_providers
highest_pressure_age_group
recruitment_priority
recruitment_reasons
```

### `county_age_metrics`

```text
county
age_group
reporting_date
current_foster_home_children
matching_licensed_providers
matching_active_providers
children_per_matching_active_provider
```

Age groups:

- `0–5`
- `6–12`
- `13–17`
- `Unknown`

### `provider_metrics`

Only currently licensed providers are needed on the retention page:

```text
provider_id
county
reporting_date
license_start_date
license_end_date
days_until_expiration
currently_has_placement
last_completed_placement_end
days_since_last_placement
total_active_days
active_days_last_365
eligible_licensed_days_last_365
engagement_rate_last_365
min_age
max_age
outreach_priority
outreach_reasons
```

### `provider_activity_periods`

Merged placement periods, without child IDs:

```text
provider_id
period_start
period_end
active_days
is_current
```

### `monthly_metrics`

```text
month
new_license_starts
license_expirations
active_provider_count
foster_home_placement_starts
```

## 6. Metric definitions

### Fixed reporting date

```text
2026-07-01
```

Never use the machine’s current date.

### Current child

```text
discharge_date is null
```

### Latest placement

The placement with the maximum `placement_index` for a child.

### Current placement

A latest placement ending on `2026-07-01`.

### Currently licensed provider

```text
license_start_date <= reporting_date
and
license_end_date > reporting_date
```

The source’s duration fields use end-exclusive boundaries, so a license ending on the reporting date is not treated as active after that cutoff.

### Current active provider

A currently licensed provider with at least one foster-home placement ending on the reporting date.

### Provider active days

Merge overlapping and adjacent foster-home placement intervals before counting days.

### Recent active days

Clip merged intervals to:

```text
[2025-07-01, 2026-07-01)
```

### Eligible recent licensed days

Clip the provider’s license interval to the same one-year window:

```text
max(license_start_date, 2025-07-01)
to
min(license_end_date, 2026-07-01)
```

### Engagement rate

```text
active_days_last_365 / eligible_licensed_days_last_365
```

Store as a decimal and display as a percentage.

### Out-of-county rate

Use current foster-home placements only:

```text
removal_county != placement_county
```

Group the demand side by normalized `removal_county`.

### Provider age-group match

A current provider preference overlaps an age group when:

```text
min_age <= group_max
and
max_age >= group_min
```

Do not call a matching provider an available bed.

## 7. Recruitment product logic

Recruitment is a **planning attention level**, not a prediction of shortage.

Use three explainable indicators:

1. Current foster-home children per active local provider
2. Current out-of-county foster-home placement rate
3. Highest age-group children-per-matching-active-provider ratio

Only classify counties with:

- At least 10 current foster-home children
- At least 3 active local providers
- Non-null values for the indicators being compared

Calculate statewide medians and 75th percentiles among eligible counties.

### High

At least two indicators are at or above their 75th percentile.

### Medium

One indicator is at or above its 75th percentile, or at least two are at or above their median.

### Low

All other eligible counties.

### Limited data

The county does not satisfy the minimum-volume rules.

Always store readable reasons, such as:

- Higher number of children per active provider than most eligible counties
- High share of children placed outside their home county
- Limited active provider base whose current preferences include ages 13–17
- Several currently licensed providers approach expiration within 90 days

Do not combine nonfamily placements into the main foster-home demand ratio. Show them separately as contextual information.

## 8. Retention product logic

Retention is an **outreach priority**, not closure risk.

### High outreach priority

Any of:

- Inactive for at least 180 days
- Inactive, license expires within 90 days, and inactive for at least 60 days
- Engagement below 10% with at least 90 eligible licensed days

### Medium outreach priority

Any of:

- Inactive for at least 90 days
- Inactive and license expires within 180 days
- Engagement below 25% with at least 90 eligible licensed days
- Currently active but license expires within 60 days

### Low outreach priority

All remaining currently licensed providers.

Evaluate High before Medium. Store all triggered reasons, not just the first reason.

## 9. UX architecture

### Navigation

- Overview
- Recruitment
- Retention
- Methodology

County and provider pages are drill-down routes, not primary navigation items.

### Visual system

Use:

- Neutral background
- One restrained blue/indigo accent
- Amber for attention
- Rose/red for high attention
- Green only for stable/current status
- Icons and text labels in addition to color
- Geist or the default Next.js system font
- Tabular numbers for metrics
- 8-point spacing system
- Consistent card, badge and table variants

Avoid:

- Gradients
- 3D charts
- Decorative animation
- More than six KPI cards above the fold
- Large blocks of explanatory text
- Unexplained scores

### Overview

Above the fold:

- Four or five KPI cards
- A “What needs attention” panel
- Reporting-date indicator

Below:

- County recruitment-pressure ranking
- License expiration trend
- Retention-priority distribution
- Placement-type context

### Recruitment

Primary artifact: county priority table.

Supporting visuals:

- Scatter plot: out-of-county rate vs children per active provider
- Age-group pressure comparison
- Top county ranking

Every visual links to a county detail page.

### County detail

Combine:

- Recruitment signals
- Age-group alignment
- Out-of-county context
- Upcoming license exposure
- Retention outreach list

This is the page that proves recruitment and retention are one capacity problem.

### Retention

Primary artifact: server-paginated provider outreach table.

Filters:

- County
- Priority
- Active/inactive
- Expiration window
- Days since activity
- Engagement-rate range
- Current age preference

### Provider detail

Show:

- License and current preference summary
- Engagement metrics
- Reasoned outreach priority
- Merged activity timeline
- Plain-language “What staff may want to review”

Never show child identifiers or child-level episodes.

## 10. Frontend architecture

```text
src/
  app/
    (dashboard)/
      layout.tsx
      page.tsx
      recruitment/
        page.tsx
        [county]/
          page.tsx
      retention/
        page.tsx
      providers/
        [providerId]/
          page.tsx
      methodology/
        page.tsx
    api/
      exports/
        recruitment/route.ts
        retention/route.ts
    error.tsx
    not-found.tsx
    loading.tsx
  components/
    charts/
    layout/
    metrics/
    tables/
    ui/
  lib/
    data/
    supabase/
    types/
    validation/
    utils/
  config/
scripts/
tests/
supabase/
  migrations/
docs/
data/
  raw/
  processed/
```

### Server and client boundaries

Server Components:

- Fetch Supabase data
- Parse search parameters
- Compute page-level summaries
- Render tables with server-fetched rows

Client Components:

- Chart rendering
- Filter controls
- Sort controls
- Mobile table interactions
- Tooltips

Do not fetch Server Component data through internal Route Handlers. Query Supabase directly from the server data layer.

### Query-state design

Filters, sorting and pagination live in URL search parameters so views are:

- Shareable
- Refresh-safe
- Back-button friendly
- Testable

Use Zod to parse and default all parameters.

### Pagination

Use server-side pagination, filtering and sorting for the provider table. Do not mix client sorting with server pagination.

## 11. Database indexes

Recommended indexes:

```text
provider_metrics (outreach_priority, county)
provider_metrics (county, currently_has_placement)
provider_metrics (license_end_date)
provider_metrics (days_since_last_placement)
provider_metrics (engagement_rate_last_365)

county_metrics (recruitment_priority)
county_metrics (children_per_active_provider desc)
county_metrics (out_of_county_foster_rate desc)

county_age_metrics (county, age_group)
provider_activity_periods (provider_id, period_start)
```

## 12. Reliability and quality

### ETL validation

Fail the build when:

- Required columns are missing
- IDs are duplicated unexpectedly
- Placement indices are duplicated or non-sequential
- Placement lengths do not match dates
- Foster-home provider IDs fail to join
- Current children do not have a current latest placement
- Provider merged active days do not match `n_days_active`
- Processed outputs contain child IDs
- Output row counts are unexpectedly zero

### Tests

Python:

- Interval merging
- Interval clipping
- Engagement denominator
- County normalization
- Current-record logic
- Recruitment classification
- Retention classification
- Privacy contract

TypeScript:

- Search-parameter parsing
- Sort allowlists
- Formatting
- DTO validation

End-to-end:

- Major routes load
- Filters update URLs
- Provider and county drill-downs work
- CSV exports respect filters
- No child identifiers appear in browser responses

Accessibility:

- Keyboard navigation
- Visible focus states
- Table headers
- Chart text summaries
- Color-independent status communication
- Automated axe checks

### CI

GitHub Actions should run:

```text
Python tests
ETL contract test
ESLint
TypeScript typecheck
Vitest
Next.js production build
Playwright smoke tests
```

## 13. Performance

See [`docs/PERFORMANCE.md`](PERFORMANCE.md) for the implemented performance architecture.

Summary:

- Keep raw events out of the runtime path.
- Query only read models with explicit column lists.
- Cache stable snapshot aggregates server-side (`unstable_cache`).
- Deduplicate shared reads (for example county-age metrics on recruitment).
- Fetch independent page data in parallel (`Promise.all`).
- Paginate and sort provider results on the server.
- Use `outreach_priority_rank` for retention priority sorting, with an in-memory fallback when the migration is not applied.
- Enable structured JSON timing logs in development or with `PERFORMANCE_LOGGING_ENABLED=true`.
- Measure production routes with `npm run benchmark:routes`.
- Keep filtered table pages dynamic.
- Add skeleton loading states.
- Avoid shipping database and business logic to the browser.

## 14. Deployment

### Vercel variables

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The loader secret is not needed by the deployed application.

### Metadata

Set:

- `noindex, nofollow`
- Descriptive title and page metadata
- Reporting date visible in the app
- Data methodology linked from every analytical page

## 15. Professional tradeoff statement

Use this in the interview:

> I separated raw data processing from the runtime application so that child-level records never reach the browser and every metric is calculated consistently and tested. The product uses transparent recruitment and outreach signals rather than predictive claims because the dataset does not include bed capacity, provider availability, or validated non-renewal outcomes. I kept the assessment deployment publicly reviewable with read-only deidentified data, while documenting the authentication and audit controls required for a real agency deployment.
