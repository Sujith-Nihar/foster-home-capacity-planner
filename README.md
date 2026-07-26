# Foster Home Capacity Planner

A full-stack, privacy-conscious decision-support application for Illinois foster-home **recruitment planning** and licensed-provider **retention outreach**.

The application converts raw provider, child, and placement records into a fixed, explainable reporting snapshot. Staff can compare county recruitment pressure, review age-group alignment, identify upcoming license exposure, filter providers by outreach signals, and drill into county and provider briefings without exposing child-level records.

**Reporting date:** July 1, 2026  
**Live application:** https://foster-home-capacity-planner.vercel.app

> This is a read-only assessment build. Recruitment attention and outreach priority are transparent staff-review categories, not official DCFS classifications, predictions, provider-quality ratings, vacancy estimates, or proof of a foster-home shortage.

---

## What I Built

The project connects two planning workflows that are usually reviewed separately:

### Recruitment planning

The recruitment workflow compares Illinois counties using:

- Current foster-home children
- Engaged local providers
- Children per engaged provider
- Out-of-county foster-home placement rate
- Age-group recruitment pressure
- Provider-license exposure within 90 and 180 days

Users can filter and sort counties, inspect why a county received a suggested attention level, export the filtered view, and open a county-level briefing.

### Retention outreach

The retention workflow reviews currently licensed providers using:

- Current placement status
- Days since the most recent completed placement
- License expiration timing
- Placement-active days during the previous 12 months
- Eligible licensed days during the same period
- Placement-activity percentage
- Licensed age preference
- Rule-based outreach reasons

Users can search, filter, sort, paginate, export, and open a provider-level briefing with clear staff follow-up prompts.

---

## Product Design Decisions

### 1. I used a fixed reporting snapshot

All analytical logic uses:

```text
REPORTING_DATE = 2026-07-01
RECENT_WINDOW = [2025-07-01, 2026-07-01)
```

The application never uses the browser or server’s current date to calculate metrics.

I made this decision because the supplied files describe one assessment snapshot. A fixed cutoff keeps the ETL, database, UI, tests, and deployment consistent across environments.

Implementation:

- Python constants are defined in `scripts/etl/config.py`
- Frontend constants are defined in `src/config/metrics.ts`
- `getActiveReportingDate()` returns the fixed reporting date
- Cached queries are keyed by the reporting date
- Tests assert the same cutoff and interval behavior

Tradeoff:

- The deployed application does not automatically become current.
- A new reporting period requires rerunning the ETL and reloading Supabase.

### 2. I separated raw-data processing from the runtime application

```text
Local CSV files
    ↓
Python/Pandas ETL and validation
    ↓
Deidentified processed read models
    ↓
Supabase PostgreSQL
    ↓
Next.js Server Components
    ↓
Interactive client filters, tables, charts, and disclosures
    ↓
Vercel
```

The runtime application never reads raw child or placement files.

I used a local ETL because the core calculations include interval merging, reporting-date rules, percentile comparisons, age-preference matching, data-contract validation, and privacy checks. These operations need one repeatable implementation rather than being recalculated in the browser.

Tradeoff:

- Refreshing data requires an ETL and loader step.
- The application is not a live event-processing system.

### 3. I used Next.js App Router without a separate API service

The application uses:

- Server Components for Supabase reads and page assembly
- Client Components only for interactions such as filters, charts, tooltips, and disclosures
- Route Handlers only for filtered CSV exports
- Dynamic routes for county and provider drill-downs
- Route-level loading, error, and not-found states

I did not add Express or FastAPI because the deployed product is read-heavy and does not require a second runtime service. This reduced deployment, authentication, networking, and maintenance overhead.

Tradeoff:

- Queue-based and long-running runtime jobs are outside this build.
- ETL execution remains separate from Vercel.

### 4. I used rule-based categories instead of predictive scores

The supplied data does not contain validated labels for:

- Foster-home shortage
- Open beds
- Provider availability
- Provider closure
- License non-renewal
- Outreach success
- Placement refusal
- Provider quality

Because these outcomes are not available, I did not train a model or create a risk score. I implemented deterministic thresholds with readable reasons.

This makes every category explainable and testable.

### 5. I designed the public deployment around deidentified read models

The assessment needs to be accessible to reviewers without a login. I therefore made the hosted dataset safe for read-only anonymous access:

- No child IDs in Supabase
- No child-level placement episodes
- No raw child dates in the browser
- Provider IDs remain pseudonymous numeric IDs
- Provider history is stored only as merged provider-level activity periods
- Supabase Row Level Security allows anonymous `SELECT`
- Anonymous `INSERT`, `UPDATE`, and `DELETE` are not granted
- The site uses `noindex, nofollow`

A real agency deployment would require SSO, role-based access, audit logging, private provider data, environment-specific RLS, and approved governance controls.

---

## Technology Used

### Application

| Technology | How it is used |
| --- | --- |
| Next.js 16.2.11 | App Router, Server Components, dynamic routes, loading/error boundaries, Route Handlers, Vercel build |
| React 19.2.4 | UI composition |
| TypeScript 5 | Strictly typed domain models, query parameters, DTOs, table state, and component contracts |
| Tailwind CSS 4 | Responsive layout and reusable visual tokens |
| shadcn 4.14.0 | Reusable UI component foundation |
| Base UI | Accessible tooltip/popover and interaction primitives |
| TanStack Table 8.21.3 | Table structure, sort controls, and responsive result presentation |
| Recharts 3.10.0 | Statewide and county analytical charts |
| Zod 4.4.3 | URL search-parameter parsing and allowlisted sort/filter values |
| date-fns 4.4.0 | Date presentation |
| Lucide React | Consistent icons |

### Data layer

| Technology | How it is used |
| --- | --- |
| Python 3.12 | ETL, profiling, validation, loading, and utility scripts |
| Pandas | Source transformations, grouping, interval-derived metrics, and deterministic outputs |
| Supabase PostgreSQL | Indexed analytical read models |
| Supabase RLS | Public read-only policies |
| Supabase RPC | Shared filter-option lookup |
| SQL migrations | Schema, constraints, indexes, RLS, and generated priority ranking |

### Quality and delivery

| Technology | How it is used |
| --- | --- |
| Pytest | Data contract, ETL logic, interval logic, recruitment, retention, privacy, and integration tests |
| Vitest | TypeScript unit and component tests |
| Testing Library | Interactive component behavior |
| Playwright | Production-build end-to-end tests |
| axe-core | Automated accessibility checks |
| GitHub Actions | Test, lint, typecheck, build, and smoke-test workflow |
| Vercel | Next.js deployment |

---

## Source Data and Validated Snapshot

The ETL validates the supplied files before generating any published metrics.

| Source | Validated records |
| --- | ---: |
| Providers | 6,063 |
| Children | 16,139 |
| Placements | 51,994 |

Statewide reporting-date results:

| Metric | Value |
| --- | ---: |
| Current children in care | 8,071 |
| Current foster-home placements | 4,343 |
| Current kin placements | 3,688 |
| Current nonfamily placements | 40 |
| Providers with a current foster-home placement | 2,733 |
| Providers licensed beyond the reporting date | 3,391 |

Raw files remain under `data/raw/` and are excluded from Git.

---

## ETL Flow

The ETL entry point is:

```bash
python3 -m scripts.etl.main
```

The implemented sequence is:

1. Load providers, children, and placements.
2. Validate schemas, IDs, dates, row counts, and relationships.
3. Normalize only the documented county variants.
4. Mark the latest placement for each child.
5. Split foster-home, kin, and nonfamily placements.
6. Select current children using null `discharge_date`.
7. Select each current child’s latest placement.
8. Build statewide placement totals.
9. Merge overlapping and adjacent provider foster-home placement intervals.
10. Validate merged provider active-day totals against the source.
11. Build provider retention metrics and outreach reasons.
12. Identify currently licensed and currently placed providers.
13. Build county recruitment metrics.
14. Build county age-group metrics.
15. Calculate statewide medians and 75th-percentile thresholds.
16. Assign county recruitment attention and reasons.
17. Build monthly trend metrics.
18. Build the statewide snapshot.
19. Hash source files and generate dataset metadata.
20. Write deterministic processed outputs.
21. Write the ETL summary, distributions, thresholds, and normalization counts.

### Processed outputs

```text
data/processed/
├── dataset_metadata.csv
├── system_snapshot.csv
├── county_metrics.csv
├── county_age_metrics.csv
├── provider_metrics.csv
├── provider_activity_periods.csv
├── monthly_metrics.csv
├── data_profile.json
└── etl_summary.json
```

Processed CSV files are also excluded from Git. Only non-sensitive metadata summaries are committed.

---

## Data Validation I Implemented

The pipeline fails instead of publishing partial or inconsistent data when:

- Required source columns are missing
- Provider IDs are duplicated
- Child IDs are duplicated
- `(id_child, placement_index)` is duplicated
- Placement indices are not sequential for a child
- Placement durations do not match the source date interval
- Foster-home provider IDs do not join to the provider source
- Current children do not have a current latest placement
- Merged provider active days do not match `n_days_active`
- Processed output contains `id_child`
- A required output is unexpectedly empty
- Expected source row counts do not match

### County normalization

I intentionally avoided fuzzy matching.

Only these verified source variants are normalized:

```text
Vermillion → Vermilion
De Witt → DeWitt
```

The narrow mapping prevents accidental county merges.

### Missing ages

Children with a missing current age:

- Stay in county total demand
- Are assigned to `Unknown`
- Are excluded from age-specific ratios only
- Are not silently removed

---

## Placement Interval Logic

Provider activity is based on the union of foster-home placement intervals.

The ETL:

1. Sorts intervals by start date.
2. Merges intervals when the next start is less than or equal to the previous end.
3. Counts each calendar day once even if multiple placements overlap.
4. Uses end-exclusive date arithmetic.
5. Clips intervals to the recent one-year window when calculating recent activity.
6. Compares merged totals with the provider source’s `n_days_active`.

Example:

```text
Placement A: [2025-01-01, 2025-02-01)
Placement B: [2025-01-20, 2025-03-01)

Merged:      [2025-01-01, 2025-03-01)
```

This prevents overlapping placements from inflating provider activity.

---

## Recruitment Business Logic

Recruitment attention is calculated for county planning review.

### Demand population

The main demand measure includes current children whose latest placement is `foster_home`, grouped by normalized removal county.

Kin and nonfamily placements remain visible as context but are not combined into the main foster-home ratio.

### Engaged local provider

The source and database columns use `active_providers`. The UI presents this as **engaged providers** to avoid confusion with license status.

An engaged provider:

- Is currently licensed
- Has at least one foster-home placement active on the reporting date
- Is grouped by normalized provider county

Provider counts do not represent open beds.

### Recruitment indicators

#### Children per engaged provider

```text
current foster-home children
÷
engaged local providers
```

#### Out-of-county foster-home placement rate

```text
current foster-home children placed outside removal county
÷
current foster-home children from the county
```

#### Highest age-group pressure

For each age group:

```text
foster-home children in the age group
÷
engaged providers whose current licensed age preference overlaps the group
```

Age groups:

```text
0–5
6–12
13–17
Unknown
```

A provider preference overlaps a group when:

```text
min_age <= group_max
and
max_age >= group_min
```

`Unknown` remains visible but is not used in the age-specific ratio.

### County eligibility

A county is included in comparative recruitment scoring when it has:

```text
at least 10 current foster-home children
at least 3 engaged providers
non-null values for all three indicators
```

Counties below the minimum are labeled `Limited data` and remain visible without being compared to larger counties.

### Recruitment attention rules

Thresholds are calculated only from eligible counties.

#### High

At least two indicators are at or above the statewide 75th percentile.

#### Medium

Either:

- At least one indicator is at or above the statewide 75th percentile, or
- At least two indicators are at or above the statewide median

#### Low

The county is eligible but does not meet High or Medium.

#### Limited data

The county does not meet the minimum comparison volume.

The ETL stores every readable reason in `recruitment_reasons`. Near-term license exposure is also added as context when at least three providers expire within 90 days.

---

## Retention Business Logic

Retention priority is calculated only for providers licensed beyond the reporting date.

### Current license rule

```text
license_start_date <= 2026-07-01
license_end_date > 2026-07-01
```

### Current placement rule

A provider has a current placement when a foster-home placement ends on the reporting date in the supplied snapshot.

The UI uses:

- `Has a current placement`
- `No current placement`

It avoids using active/inactive as the primary label because that can be confused with license status.

### Recent placement activity

```text
active_days_last_365
÷
eligible_licensed_days_last_365
```

The denominator is clipped to the provider’s actual licensed overlap with:

```text
[2025-07-01, 2026-07-01)
```

A provider licensed for only part of the year is therefore not compared against a full 365-day denominator.

This metric describes recorded placement activity. It is not a provider-quality score and does not show placement offers or refusals.

### High suggested outreach

High is assigned when any High condition applies:

- No current placement for at least 180 days
- No current placement for at least 60 days and license ends within 90 days
- No current placement, at least 90 eligible licensed days, and recent placement activity below 10%

### Medium suggested outreach

Medium is evaluated only when no High rule applies.

It is assigned when any Medium condition applies:

- No current placement for at least 90 days
- No current placement and license ends within 180 days
- At least 90 eligible licensed days and recent placement activity below 25%
- Has a current placement, at least 90 eligible licensed days, and recent placement activity below 10%
- Has a current placement and license ends within 60 days

### Low suggested outreach

No High or Medium condition applies.

### Reason storage

All triggered reasons are stored in `outreach_reasons`.

The compact table shows one primary reason and allows additional reasons to be expanded. The provider page shows the readable explanation, the actual value, the triggered rule, and staff follow-up prompts.

---

## Supabase Read Models

The database stores only processed and deidentified data.

| Table | Purpose |
| --- | --- |
| `dataset_metadata` | Dataset version, reporting date, hashes, ETL version, and source counts |
| `system_snapshot` | Statewide KPI totals |
| `county_metrics` | County recruitment indicators and retention context |
| `county_age_metrics` | County demand and provider overlap by age group |
| `provider_metrics` | Currently licensed provider outreach metrics |
| `provider_activity_periods` | Merged provider activity periods without child IDs |
| `monthly_metrics` | Monthly license and placement trends |

### Database constraints

The migrations enforce:

- Composite and unique primary keys
- Reporting-date relationships
- Non-negative metric values
- Percentage ranges between 0 and 1
- Valid recruitment and outreach category values
- Valid age-group values
- `min_age <= max_age`
- Valid provider activity date ranges

### RLS model

All seven tables have Row Level Security enabled.

The `anon` role receives:

```text
SELECT only
```

The `anon` role does not receive write permissions.

The secret/service-role key is used only by the local loader and is never imported under `src/`.

---

## Indexing and Sorting Decisions

I created indexes around the actual filter and sort paths instead of indexing every column.

### County indexes

```sql
county_metrics (recruitment_priority)
county_metrics (children_per_active_provider DESC NULLS LAST)
county_metrics (out_of_county_foster_rate DESC NULLS LAST)
county_metrics (reporting_date)

county_age_metrics (county, age_group)
county_age_metrics (reporting_date)
```

These support:

- Suggested attention filtering
- Recruitment pressure ranking
- Out-of-county sorting
- Reporting-snapshot filtering
- County age-group detail lookup

### Provider indexes

```sql
provider_metrics (outreach_priority, county)
provider_metrics (county, currently_has_placement)
provider_metrics (license_end_date)
provider_metrics (days_since_last_placement)
provider_metrics (engagement_rate_last_365)
provider_metrics UNIQUE (provider_id)
provider_activity_periods (provider_id, period_start)
```

These support:

- County and outreach-priority filters
- Current-placement filters
- Expiration-window filters
- Inactivity filters
- Placement-activity filters
- Provider detail lookup
- Provider activity timeline lookup

### Business-order sorting

PostgreSQL text sorting does not produce the required outreach order:

```text
High → Medium → Low
```

I added a stored generated column:

```sql
CASE outreach_priority
  WHEN 'High' THEN 0
  WHEN 'Medium' THEN 1
  WHEN 'Low' THEN 2
END
```

The supporting index is:

```sql
(reporting_date, outreach_priority_rank, provider_id)
```

The retention query then applies deterministic tie-breakers:

1. `outreach_priority_rank`
2. `days_until_expiration`
3. `days_since_last_placement`
4. `provider_id`

This keeps priority sorting inside PostgreSQL and preserves correct server pagination.

### Migration fallback

If `outreach_priority_rank` has not yet been applied, the data layer:

1. Executes the filtered provider query
2. Applies the business priority order in memory
3. Slices the requested page

The fallback preserves correct results but is slower. After the migration, the indexed database path is used.

### Recruitment sorting

Recruitment numeric sorts are performed in Supabase.

Suggested recruitment priority uses explicit business ordering in the server data layer because the county dataset is small. Results use county name as a deterministic secondary sort.

### Sort allowlists

The application never forwards an arbitrary URL value into `.order()`.

Zod validates sort fields against explicit allowlists for recruitment and retention. Invalid values fall back to the documented defaults.

---

## Query-State and Pagination Design

Recruitment and retention filters, sorting, page number, and page size are stored in URL search parameters.

Example:

```text
/retention?priority=High&county=Cook&sort=days_until_expiration&direction=asc&page=1&pageSize=25
```

I used this approach so filtered views are:

- Shareable
- Bookmarkable
- Refresh-safe
- Back-button friendly
- Exportable with the same parameters
- Testable without hidden client state

Zod validates:

- Priority values
- Comparison status
- Activity status
- Expiration windows
- Age groups
- Percentage ranges
- Inactivity ranges
- Provider IDs
- Sort fields
- Sort direction
- Page number
- Allowed page sizes

Provider results are filtered, sorted, counted, and paginated on the server.

The result includes:

```text
items
page
pageSize
totalCount
totalPages
```

Page values are normalized when filters reduce the available result set.

---

## Runtime Performance Work

### Fixed-snapshot caching

Because the application serves one frozen reporting snapshot, stable reads use Next.js `unstable_cache` with a one-year revalidation window.

Cached data includes:

- Reporting date
- System snapshot
- Monthly metrics
- Dataset metadata
- County-age metrics
- County recruitment ranking
- Largest counties
- County detail records
- Filter options
- Retention summary counts
- Retention priority distribution
- Provider activity timelines

Filtered recruitment and retention result pages remain dynamic.

### Removed duplicate reads

The recruitment page previously needed county-age data for more than one feature. I changed it to load `county_age_metrics` once and derive:

- Age-group pressure
- County age-group maps
- Statewide age-group benchmarks

from the same cached result.

### Parallel data loading

Independent reads are executed with `Promise.all`.

Examples:

- Overview: snapshot, monthly metrics, county rankings, retention summary
- Recruitment: county results, filter options, county-age metrics
- Retention: paginated providers, filter options, summary metrics
- County detail: county record, age-group data, provider preview
- Provider detail: provider record, activity periods, county context

### Explicit column selection

Supabase queries select only the columns required by each page instead of using `select("*")`.

This reduces response size and prevents unintended columns from entering the application.

### Cached reporting date

`getActiveReportingDate()` returns the fixed application constant and is wrapped with React `cache()`. This removed repeated metadata queries on each request.

### Detail-route strategy

I did not statically generate all county and provider pages.

Reasons:

- County detail pages include query-driven provider previews
- Provider routes cover thousands of records
- Pre-generating every provider page would increase build output and deployment time

Instead, detail reads are cached by reporting date, county name, or provider ID, and route loading shells stream while queries complete.

### Structured timing logs

`src/lib/performance/timing.ts` can emit JSON timing records containing:

- Route
- Operation
- Duration
- Row count
- Success status
- Cache status

Logging is enabled:

- In development, or
- With `PERFORMANCE_LOGGING_ENABLED=true`

Example:

```json
{
  "route": "/retention",
  "operation": "listRetentionProviders",
  "duration_ms": 118,
  "row_count": 25,
  "success": true,
  "cache": "miss"
}
```

### Production benchmark

The repository includes:

```bash
npm run benchmark:routes
```

The benchmark runs against a production server and measures cold and warm HTML response times for:

- Core pages
- Eligible counties
- A limited-data county
- Active and inactive providers
- A multi-reason provider
- Not-found routes

A documented local production run showed approximately:

| Route | Cold | Warm average |
| --- | ---: | ---: |
| `/` | 49 ms | 20 ms |
| `/recruitment` | 388 ms | 222 ms |
| `/retention` | 177 ms | 118 ms |
| `/methodology` | 11 ms | 11 ms |
| `/recruitment/Cook` | 119 ms | 96 ms |
| `/providers/500021` | 97 ms | 109 ms |

These values are local observations, not service-level guarantees.

---

## Application Routes

| Route | Implementation |
| --- | --- |
| `/` | Statewide overview, attention summary, recruitment ranking, license exposure, optional charts |
| `/recruitment` | County filters, sorting, pagination, export, and statewide recruitment analysis |
| `/recruitment/[county]` | County briefing, age-group comparison, reasons, retention preview, and provider context |
| `/retention` | Server-filtered and server-paginated provider outreach list |
| `/providers/[providerId]` | Provider briefing, triggered rules, license status, activity metrics, timeline, and follow-up prompts |
| `/methodology` | Definitions, implemented calculations, planning rules, limitations, and dataset metadata |
| `/api/exports/recruitment` | Filtered recruitment CSV |
| `/api/exports/retention` | Filtered retention CSV |

Exports reuse the same validated query parameters and server data layer as the visible tables.

- Recruitment export is capped at 500 county rows.
- Retention export is capped at 5,000 provider rows.
- Filenames are sanitized.
- CSV values are escaped for commas, quotes, and newlines.

---

## UI and Interaction Decisions

I designed the application as a planning workflow rather than a dense dashboard.

### Information hierarchy

Each analytical page follows this order:

1. Purpose
2. Primary statewide or record-level signal
3. Plain-language caution
4. Search/filter controls
5. Decision table or briefing
6. Supporting analysis
7. Methodology and limitations

### Terminology

I standardized labels to avoid unsupported conclusions:

| Avoided label | UI label |
| --- | --- |
| Active provider | Engaged provider / Has a current placement |
| Inactive provider | No current placement |
| Risk score | Suggested attention / Suggested outreach |
| Capacity | Provider base or placement context |
| Shortage | Recruitment review signal |
| Prediction | Staff-review category |

### Priority explanation

High and Medium badges include:

- Text
- Icon
- Consistent color treatment
- Keyboard-accessible explanation
- Mobile tap support
- Plain-language rule description

The UI does not rely on color alone.

### Progressive disclosure

Technical formulas and secondary factors are collapsed until requested. The main table stays readable while the full methodology remains available.

### Responsive behavior

- Desktop tables retain comparison columns
- Mobile layouts convert dense rows to readable cards
- Navigation adapts to smaller screens
- Filter layouts wrap without horizontal overflow
- Long priority labels remain inside their table cells
- A global back-to-top control appears after scrolling

### Accessibility

Implemented checks and behavior include:

- Semantic headings
- Keyboard navigation
- Visible focus styles
- Accessible table headers
- Tooltip and popover keyboard support
- Chart text summaries
- Status text in addition to color
- Reduced-motion behavior
- Automated axe scans

---

## Testing Performed

### Python tests

The Python suite covers:

- Source date parsing
- Invalid date rejection
- Required-column validation
- Expected row counts
- Unique provider and child IDs
- Placement-index uniqueness and sequence
- County normalization
- Missing-age counts
- Interval day calculation
- Overlap merging
- Adjacent interval merging
- Interval clipping
- Recent-window active days
- Eligible licensed-day denominator
- Merged active-day validation against the provider source
- Recruitment percentile thresholds
- High, Medium, Low, and Limited-data recruitment classification
- Provider age-group overlap
- Out-of-county calculation
- Retention High, Medium, and Low classification
- High-priority precedence
- Processed-output privacy contract
- Full ETL integration and output generation

Primary files:

```text
tests/test_data_contract.py
tests/test_etl_intervals.py
tests/test_etl_recruitment.py
tests/test_etl_retention.py
tests/test_etl_integration.py
```

### Vitest and component tests

The TypeScript suite covers:

- URL search-parameter parsing
- Invalid parameter defaults
- Sort allowlists
- County search
- Pagination normalization
- Result-count labels
- Recruitment classification labels
- Outreach priority badges
- Additional outreach factors
- Reason summaries
- Provider-detail calculations
- Age-group calculations
- Formatting and pluralization
- Methodology content
- Overview insights
- Optional analysis disclosure
- Back-to-top behavior
- Motion tokens

### Playwright end-to-end tests

The E2E suite runs against a production Next.js server on:

```text
http://127.0.0.1:3100
```

It covers:

- Overview
- Recruitment
- Retention
- Methodology
- County detail
- Provider detail
- Recruitment pagination
- Recruitment table behavior
- Retention table behavior
- Filter URL updates
- Keyboard operation
- Responsive layouts
- Loading and empty states
- Error and not-found states
- Metric explanations
- Back-to-top behavior
- Brand alignment
- Motion behavior
- Favicon metadata
- Privacy checks
- Accessibility scans

Playwright configuration:

- Chromium desktop project
- Fully parallel locally
- One worker in CI
- Two retries in CI
- Trace on first retry
- Production server instead of `next dev`

### Production-readiness verification

The repository includes:

```bash
npm run verify
```

This executes:

```text
pytest tests -q
pytest tests/test_data_contract.py -q
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

It also fails when:

- Raw CSV files are tracked by Git
- Processed CSV files are tracked by Git
- `SUPABASE_SECRET_KEY` is referenced under `src/`

---

## GitHub Actions Workflow

The workflow is defined in:

```text
.github/workflows/ci.yml
```

It is currently manually dispatchable and uses concurrency cancellation for duplicate runs on the same ref.

Jobs:

1. **Python tests**
2. **ETL data-contract test**
3. **ESLint and TypeScript**
4. **Vitest**
5. **Next.js build**
6. **Playwright smoke tests**

Dependencies:

- The Next.js build waits for ESLint/TypeScript and Vitest.
- Playwright waits for the production build.
- A Playwright report is uploaded when the smoke tests fail.

Required GitHub repository secrets:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

---

## Development and Integration Steps

### 1. Install application dependencies

```bash
npm ci
```

### 2. Create the Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Local loader only
SUPABASE_SECRET_KEY=
```

### 4. Add raw files locally

```text
data/raw/provider_level_updated.csv
data/raw/child_level.csv
data/raw/placement_level.csv
```

### 5. Validate and profile the data

```bash
pytest tests/test_data_contract.py -q
python3 -m scripts.profile_data
```

### 6. Run the complete ETL

```bash
python3 -m scripts.etl.main
```

Review:

```text
data/processed/data_profile.json
data/processed/etl_summary.json
```

### 7. Apply Supabase migrations

```bash
supabase login
supabase link --project-ref <project-ref>
npx supabase db push
supabase db lint
```

Migration order:

```text
20260722184500_create_read_models.sql
20260722184501_enable_row_level_security.sql
20260722184502_create_filter_options_function.sql
20260724150000_add_provider_outreach_priority_rank.sql
```

### 8. Validate the loader without writing

```bash
python3 scripts/load_to_supabase.py --dry-run
```

The loader validates:

- Expected processed files
- Expected row counts
- Forbidden child-level columns
- Required environment variables

### 9. Load the read models

```bash
python3 scripts/load_to_supabase.py
```

The loader:

- Loads in foreign-key dependency order
- Uses deterministic idempotent upserts
- Defaults to batches of 500
- Retries transient failures with bounded exponential backoff
- Verifies row counts after loading
- Never logs secrets

### 10. Run the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 11. Run the complete verification suite

```bash
npm run verify
```

### 12. Run production performance checks

```bash
npm run build
npm run start
```

In another terminal:

```bash
npm run benchmark:routes
```

---

## Deployment Process

### Supabase

Before deploying the application:

1. Create or link the Supabase project.
2. Apply all migrations.
3. Run the ETL locally.
4. Run the loader dry run.
5. Load the processed read models.
6. Confirm database row counts.
7. Verify anonymous reads.
8. Verify anonymous writes fail.

### Vercel

Only the Next.js application is deployed to Vercel.

Required variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Do not add:

```text
SUPABASE_SECRET_KEY
```

Deployment steps:

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Keep the default Next.js framework preset.
4. Add the public Supabase variables.
5. Deploy.
6. Confirm the application is publicly accessible.
7. Verify the main pages and drill-down routes.
8. Test recruitment and retention exports.
9. Confirm `noindex, nofollow`.
10. Confirm browser responses do not include child identifiers.

### Data refresh behavior

When only source data changes:

1. Run the ETL.
2. Reload Supabase.
3. Invalidate or allow the snapshot cache to refresh as configured.

A Vercel redeploy is required only when application code changes.

---

## Architecture Tradeoffs

| Decision | Benefit | Tradeoff |
| --- | --- | --- |
| Local ETL before runtime | Consistent metrics, privacy, testability | Manual or scheduled refresh required |
| Deidentified read models | Smaller queries and safer public deployment | No child-level drill-down |
| Fixed reporting date | Deterministic behavior and tests | Not automatically current |
| Next.js without separate API | Fewer services and simpler deployment | No queue or long-running backend |
| Rule-based categories | Explainable and auditable | No future-outcome prediction |
| Public read-only assessment | Easy reviewer access | Not suitable for real agency operations without auth |
| URL-backed filters | Shareable and reproducible views | More query-parameter validation |
| Server-side provider pagination | Small responses and correct global sorting | More database query design |
| Generated priority rank | Indexed High → Medium → Low sorting | Requires migration |
| In-memory migration fallback | Correct behavior before migration | Higher latency |
| Long-lived cache for fixed snapshot | Faster stable aggregate pages | Data changes need cache-refresh planning |
| Dynamic detail routes | Smaller build output | First request may wait for Supabase |
| CSV Route Handlers | Same filters as the UI | Export row limits are required |
| No runtime AI | No hallucination or unexplained score | No natural-language analytics feature |

---

## Security and Privacy Controls

- Raw files are Git-ignored.
- Processed CSVs are Git-ignored.
- Raw child and placement data never enter Vercel.
- `id_child` is forbidden in public processed outputs.
- Supabase stores only read models.
- RLS is enabled on all public tables.
- Anonymous access is read-only.
- The application uses only the publishable key.
- The secret key is restricted to the local loader.
- `npm run verify` checks that the secret key is not referenced in `src/`.
- Source files are fingerprinted with SHA-256 hashes.
- Dataset metadata records the ETL version and generation timestamp.
- Site metadata uses `noindex, nofollow`.
- Next.js security headers are configured in `next.config.ts`.

---

## Current Limitations

- The application uses one fixed reporting snapshot.
- No authentication or RBAC is included in the assessment.
- Provider counts do not represent available beds.
- No placement-offer, refusal, or provider-availability data exists.
- No provider-contact outcome is recorded.
- Current licensed age preferences may differ from historical preferences.
- Out-of-county placement may occur for reasons unrelated to shortage.
- Placement activity is not a provider-quality measure.
- Limited-data counties are visible but not comparatively scored.
- Recruitment export is capped at 500 rows.
- Retention export is capped at 5,000 rows.
- The application is read-only and does not manage outreach workflow.

---

## Production Extension

For an operational agency deployment, I would add:

- Microsoft Entra ID or approved agency SSO
- Role-based access
- Audit logs
- Private provider-detail policies
- Assigned staff owner
- Outreach notes and contact history
- Renewal workflow status
- Scheduled ETL orchestration
- Dataset promotion between development, staging, and production
- Freshness and schema-drift alerts
- Monitoring and incident response
- Approved retention and governance controls
- Available-bed, provider-availability, placement-offer, and refusal data

---

## Repository Documentation

| Document | Repository-specific content |
| --- | --- |
| `docs/PROJECT_SPEC.md` | Scope, acceptance criteria, business requirements, and privacy constraints |
| `docs/ARCHITECTURE.md` | End-to-end architecture, data facts, metrics, UX boundaries, reliability, and tradeoffs |
| `docs/DECISIONS.md` | Major implementation decisions and accepted tradeoffs |
| `docs/PERFORMANCE.md` | Caching, query deduplication, indexing, sorting, timing logs, and benchmark results |
| `docs/DATA_DICTIONARY.md` | Processed table and field definitions |
| `docs/SUPABASE_SETUP.md` | Migration, RLS, loader, and refresh steps |
| `docs/VERCEL_DEPLOYMENT.md` | Vercel variables, deployment, post-deploy checks, and refresh workflow |

---

## Commands

```bash
# Application
npm ci
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run start

# End-to-end
npm run test:e2e
npm run test:e2e:ui

# Python
pytest tests -q
python3 -m scripts.profile_data
python3 -m scripts.etl.main

# Supabase
npx supabase db push
supabase db lint
python3 scripts/load_to_supabase.py --dry-run
python3 scripts/load_to_supabase.py

# Complete verification
npm run verify

# Production route benchmark
npm run benchmark:routes
```

---

## AI Usage Disclosure

AI-assisted development tooling, including Cursor, was used to accelerate implementation, debugging, test authoring, and documentation drafting.

The analytical rules, reporting-date logic, privacy constraints, database design, validation requirements, and acceptance criteria are implemented as deterministic code and verified through:

- Data-contract checks
- Python ETL tests
- TypeScript unit tests
- Playwright end-to-end tests
- Accessibility checks
- Production builds
- Supabase constraints and RLS
- Manual review

No runtime LLM or AI feature is included in the deployed application.

---

## Author

**Sujith Thota**

- GitHub: https://github.com/Sujith-Nihar
- Repository: https://github.com/Sujith-Nihar/foster-home-capacity-planner
- Live application: https://foster-home-capacity-planner.vercel.app
