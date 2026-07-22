# PROJECT_SPEC.md — Cursor Operating Contract

You are building a production-quality take-home assessment called **Foster Home Capacity Planner**.

Read this entire specification before changing files. Do not invent requirements, columns, metrics or data.

## Product

The application supports two connected workflows for Illinois DCFS staff:

1. **Recruitment:** identify counties and child age groups that warrant additional foster-home recruitment attention.
2. **Retention:** identify currently licensed foster homes that warrant staff outreach based on inactivity, low recent engagement or approaching license expiration.

The users understand child welfare but are not data experts.

Every page must communicate:

- What is happening
- Where it is happening
- Why it matters
- What staff may want to review next

## Technology

Use:

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Recharts
- TanStack Table
- Supabase PostgreSQL
- Python and Pandas
- Pytest
- Vitest
- Playwright
- Vercel

Do not create a separate Express or FastAPI backend.

Do not add authentication to the assessment build.

Do not add runtime AI, an LLM chatbot or predictive machine learning.

Do not use mock data after processed data exists.

## Data locations

```text
data/raw/provider_level_updated.csv
data/raw/child_level.csv
data/raw/placement_level.csv
```

Never expose these files through `public/`.

Never upload raw child or placement records to Supabase.

## Source schemas

### Provider

```text
id_provider
license_start_date
license_end_date
county_provider
n_days_licensed
n_days_active
min_age
max_age
```

### Child

```text
id_child
removal_date
discharge_date
age_at_removal
most_recent_age
removal_county
```

### Placement

```text
id_child
placement_start_date
placement_end_date
resource_type_on_this_placement
placement_index
removal_county
placement_county
id_provider
placement_length
```

## Validated source facts

```text
Reporting date: 2026-07-01
Providers: 6,063
Children: 16,139
Placements: 51,994
Current children: 8,071
Current foster-home placements: 4,343
Current kin placements: 3,688
Current nonfamily placements: 40
Unique providers currently supporting foster-home placements: 2,733
Providers licensed beyond reporting date: 3,391
```

Additional facts:

- Provider IDs are unique.
- Child IDs are unique.
- `(id_child, placement_index)` is unique.
- Placement indices are sequential per child.
- `placement_length` equals `placement_end_date - placement_start_date`.
- All current children have a latest placement ending on `2026-07-01`.
- Foster-home provider IDs all join to the provider table.
- Kin placements have no provider ID.
- Nonfamily provider IDs do not join to the foster-provider table.
- `n_days_active` equals the union of each provider’s foster-home placement intervals.
- Every provider has at least one foster-home placement.
- Provider age preferences are current preferences.
- A small number of child ages are missing.

## Date rules

Use fixed constants:

```text
REPORTING_DATE = 2026-07-01
RECENT_WINDOW_START = 2025-07-01
```

Date intervals are end-exclusive.

A current child has a null `discharge_date`.

A child’s latest placement is the highest `placement_index`.

A latest placement ending on `REPORTING_DATE` is active at the cutoff.

A currently licensed provider satisfies:

```text
license_start_date <= REPORTING_DATE
license_end_date > REPORTING_DATE
```

## County normalization

Apply only this documented mapping:

```text
Vermillion -> Vermilion
De Witt -> DeWitt
```

All joins and displayed metrics use normalized county names.

Log every normalization count.

Do not add fuzzy matching.

## Missing ages

Create age groups:

```text
0–5
6–12
13–17
Unknown
```

Children with unknown age remain in total demand counts but are not included in age-specific ratios.

## Privacy

No public output may contain:

```text
id_child
removal_date at child level
discharge_date at child level
child-level placement episodes
```

Provider activity periods must be merged and contain no child IDs.

Set site metadata to `noindex, nofollow`.

## Architecture

```text
Local CSVs
→ Python ETL and validation
→ Processed deidentified files
→ Supabase read models
→ Next.js Server Components
→ Client chart/filter components
→ Vercel
```

Use Server Components to query Supabase directly.

Use Route Handlers only for filtered CSV exports.

Use URL search parameters for filtering, sorting and pagination.

Use server-side pagination, filtering and sorting for provider lists.

## Public tables

Create:

```text
dataset_metadata
system_snapshot
county_metrics
county_age_metrics
provider_metrics
provider_activity_periods
monthly_metrics
```

Enable RLS.

Assessment policy:

- anonymous `SELECT`
- no anonymous `INSERT`
- no anonymous `UPDATE`
- no anonymous `DELETE`

The loader uses the secret key locally. The deployed application uses only the publishable key.

## Recruitment metrics

Main demand population:

- Current children
- Latest placement type is `foster_home`
- Group by normalized `removal_county`

Show current kin and nonfamily counts separately as context.

Do not combine nonfamily records into the main foster-home demand ratio.

Active local provider:

- Currently licensed
- Has a current foster-home placement
- Group by normalized `county_provider`

Calculate:

```text
children_per_active_provider
out_of_county_foster_count
out_of_county_foster_rate
age_group_pressure
expiring_90_days
expiring_180_days
```

Out-of-county uses current foster-home placements where:

```text
normalized removal_county != normalized placement_county
```

A provider preference overlaps an age group when:

```text
min_age <= group_max
max_age >= group_min
```

Never describe provider counts as available beds or vacancies.

### Recruitment eligibility

A county is eligible for comparative priority only when:

```text
current_foster_home_children >= 10
active_providers >= 3
```

### Recruitment priority

Compare eligible counties using:

1. `children_per_active_provider`
2. `out_of_county_foster_rate`
3. highest non-null `children_per_matching_active_provider`

Calculate statewide medians and 75th percentiles.

- High: at least two indicators are at or above the 75th percentile
- Medium: one indicator is at or above the 75th percentile, or at least two are at or above the median
- Low: otherwise
- Limited data: minimum volume rules are not met

Store all readable reasons.

Call this a planning priority, not a proven shortage.

## Retention metrics

Only currently licensed providers are published in `provider_metrics`.

Calculate:

```text
days_until_expiration
currently_has_placement
last_completed_placement_end
days_since_last_placement
total_active_days
active_days_last_365
eligible_licensed_days_last_365
engagement_rate_last_365
```

Merge overlapping and adjacent foster-home placement intervals.

Clip recent activity and eligible license days to:

```text
[2025-07-01, 2026-07-01)
```

For active providers:

- `currently_has_placement = true`
- `days_since_last_placement = 0`
- `last_completed_placement_end` may be null if no earlier completed interval exists

### High outreach priority

Any of:

- inactive for at least 180 days
- inactive, expires within 90 days and inactive for at least 60 days
- engagement below 10% with at least 90 eligible licensed days

### Medium outreach priority

Any of:

- inactive for at least 90 days
- inactive and expires within 180 days
- engagement below 25% with at least 90 eligible licensed days
- active and expires within 60 days

### Low outreach priority

All other currently licensed providers.

Evaluate High before Medium.

Store every triggered reason.

Use “Outreach priority.” Never use:

- risk score
- closure prediction
- non-renewal probability

## Routes

```text
/
 /recruitment
 /recruitment/[county]
 /retention
 /providers/[providerId]
 /methodology
```

## Page requirements

### Overview

- 4–6 KPI cards
- What-needs-attention panel
- Placement-type context
- Recruitment county ranking
- License expiration trend
- Retention-priority distribution
- Deterministic insight text

### Recruitment

- County table
- Priority and metric filters
- URL-backed sorting
- Scatter or ranking visualization
- Age-pressure visualization
- Limited-data treatment
- Filtered CSV export
- Links to county pages

### County detail

- Recruitment priority and reasons
- Current foster-home demand
- Kin and nonfamily context
- Active local provider base
- Out-of-county rate
- Age-group pressure
- Expiration exposure
- Retention outreach list
- Links to provider pages

### Retention

- Server-paginated provider table
- County, priority, activity, expiration, inactivity, engagement and age-preference filters
- Provider-ID search
- Filtered CSV export
- Explainable reason tags

### Provider detail

- License dates
- Current age preferences
- Current placement status
- Engagement metrics
- Merged activity timeline
- Priority reasons
- Plain-language review summary
- No child-level data

### Methodology

Document every calculation, assumption, limitation and threshold.

## UX standards

Use a calm public-sector visual system.

- Neutral base
- Restrained blue accent
- Text and icon status labels
- Visible focus states
- Consistent 8-point spacing
- Tabular numbers
- Responsive cards and tables
- Sticky table headers where useful
- Clear empty, loading and error states
- No decorative animation
- No 3D charts
- No unexplained scores
- No color-only status

Every chart needs:

- Title
- One-sentence explanation
- Axis labels where applicable
- Tooltip
- Accessible text summary
- Empty state
- Link or action when useful

## Code standards

- TypeScript strict mode
- No `any` unless documented
- Zod for URL parameters and external data boundaries
- Separate database queries, DTOs, validators, formatters and components
- Allowlist sortable fields
- Never interpolate user input into SQL
- Select only required columns
- Use server-side pagination and consistent server-side sorting
- No service/secret key in application code
- No child identifier in browser payloads

## Tests

Python:

- Date parsing
- County normalization
- Interval merging
- Adjacent intervals
- Interval clipping
- Current-record logic
- Engagement calculation
- Age matching
- Recruitment priority
- Retention priority
- Privacy output contract

TypeScript:

- Search parameter parsing
- Sort allowlists
- Formatting
- DTO validation

Playwright:

- Major routes
- Filters
- Drill-downs
- CSV exports
- Responsive navigation
- No child identifiers
- Axe accessibility checks

## Working protocol

After each task:

1. Run relevant tests.
2. Run ESLint.
3. Run TypeScript type checking.
4. Run the production build when the phase affects the application.
5. List changed files.
6. List commands run.
7. State remaining risks or TODOs.
8. Stop and wait for the next instruction.

Do not continue into the next phase automatically.
