# Foster Home Capacity Planner

Decision-support application for Illinois DCFS foster-home **recruitment planning** and licensed-provider **retention outreach**. The product helps staff answer where pressure is highest, which counties may warrant recruitment attention, and which licensed providers may benefit from follow-up review.

Reporting date for this build: **July 1, 2026**.

## Problem

Illinois DCFS needs a readable way to connect statewide placement pressure, county-level recruitment signals, and provider retention outreach priorities without exposing child-level records or implying predictive closure risk.

## Users

- DCFS planning and licensing staff reviewing statewide capacity
- County-focused recruitment planners comparing demand, provider supply, and age-group pressure
- Retention staff reviewing licensed providers by outreach priority, engagement, and license timing

## Product decisions

- **Read-only assessment build** with no authentication, no runtime AI, and no predictive models
- **Fixed reporting date** (`2026-07-01`) for all metrics; the UI never uses the machine current date
- **Recruitment priority** is comparative planning attention among eligible counties, not proof of shortage
- **Outreach priority** is rule-based decision support, not predicted closure or non-renewal
- **Provider counts are not beds**; the UI explicitly avoids vacancy or capacity claims
- **Kin and nonfamily counts** are contextual and are not automatically treated as standard foster-home demand
- **URL search parameters** are the source of truth for filters, sorting, and pagination
- **Server-side data access** from Supabase using the publishable key only

## Architecture

```text
Local raw CSVs
  → Python ETL + validation
  → Processed deidentified CSVs
  → Supabase PostgreSQL read models
  → Next.js App Router (Server Components + client charts/filters)
  → Vercel
```

Key routes:

| Route | Purpose |
| --- | --- |
| `/` | Statewide overview, attention panel, charts |
| `/recruitment` | County recruitment priorities and filters |
| `/recruitment/[county]` | County drill-down with retention preview |
| `/retention` | Server-paginated provider outreach list |
| `/providers/[providerId]` | Provider license, engagement, and activity context |
| `/methodology` | Definitions, assumptions, and limitations |
| `/api/exports/*` | Filtered CSV exports only |

See also: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md), [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md).

## Performance architecture

The application serves a **fixed reporting snapshot through July 1, 2026**. To keep pages responsive without changing staff-facing behavior:

- **Stable read models are cached server-side** for statewide aggregates, filter options, and shared county-age metrics.
- **Duplicate Supabase queries were removed**, including repeated reporting-date lookups and duplicate county-age metric loads on recruitment.
- **Independent data requests run in parallel** when assembling overview, recruitment, and retention pages.
- **Provider filtering, sorting, and pagination stay on the server** so tables do not download the full provider list.
- **Retention priority sorting uses `outreach_priority_rank`** in PostgreSQL, with a safe in-memory fallback until the migration is applied.
- **Structured performance logging** can be enabled for JSON timing output per server operation.
- **Production routes can be measured** with `npm run benchmark:routes` after `npm run build` and `npm run start`.

Full details, migration notes, and benchmark methodology: [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md).


## Setup

### Prerequisites

- Node.js 20+
- Python 3.12+
- Supabase project with migrations applied and processed data loaded

### Application

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm ci
npx supabase db push
npm run dev
```

`npx supabase db push` applies SQL migrations in `supabase/migrations/`, including indexes and `outreach_priority_rank` for retention sorting. See [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

Open [http://localhost:3000](http://localhost:3000).

### Python ETL environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
```

## ETL

Generate processed, deidentified outputs from local raw CSVs:

```bash
python3 -m scripts.etl.main
python3 -m scripts.profile_data
```

Outputs land in `data/processed/` (CSV artifacts are gitignored). Committed metadata includes `data_profile.json` and `etl_summary.json`.

Load to Supabase locally:

```bash
# Set SUPABASE_SECRET_KEY in .env.local for the loader only
python3 scripts/load_to_supabase.py
```

See [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

## Database

Public read models:

- `dataset_metadata`
- `system_snapshot`
- `county_metrics`
- `county_age_metrics`
- `provider_metrics`
- `provider_activity_periods`
- `monthly_metrics`

Row Level Security allows anonymous `SELECT` only. Raw child identifiers never reach Supabase.

## Deployment

Deploy the Next.js app to Vercel. Use **publishable Supabase credentials only** in production.

See [`docs/VERCEL_DEPLOYMENT.md`](docs/VERCEL_DEPLOYMENT.md) for environment-variable instructions.

## Tests

```bash
# Full local verification suite
npm run verify

# Individual checks
pytest tests -q
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e

# Production route timing (requires npm run start in another terminal)
npm run benchmark:routes
```

GitHub Actions runs the same checks in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Security

- Raw CSVs remain local and are gitignored
- Processed CSVs are gitignored; only aggregated read models are loaded to Supabase
- `SUPABASE_SECRET_KEY` is used by the local loader only and is never referenced in `src/`
- No `id_child`, child-level removal/discharge dates, or child-level placement histories are published
- Site metadata uses `noindex, nofollow`
- Security headers are configured in `next.config.ts`

## Assumptions

- Provider IDs are unique and join foster-home placements to the provider table
- Latest placement is the highest `placement_index` per child
- Current children have null `discharge_date`
- County normalization uses only the documented `Vermillion → Vermilion` and `De Witt → DeWitt` map
- Provider age preferences in source data represent current preferences
- A small number of child ages are missing and are grouped as `Unknown`

## Limitations

- Single reporting-date snapshot; not a live operational system
- No authentication or role-based access control in this assessment build
- No modeling of available beds, household composition, or placement approval constraints
- Recruitment comparisons exclude limited-data counties below minimum volume thresholds
- Export endpoints cap output at 5,000 rows

Full metric definitions: [`/methodology`](/methodology) in the running app.

## Production extension

Reasonable next steps for a production deployment:

- Authenticated staff access and audit logging
- Scheduled ETL refresh with versioned dataset promotion
- Additional QA environments and masked staging data
- Deeper county/provider workflow integrations
- Expanded accessibility and performance monitoring

## AI usage disclosure

AI-assisted tooling (including Cursor) was used to accelerate implementation, test authoring, and documentation drafting. All metric rules, ETL logic, privacy constraints, and acceptance criteria were defined in the project specification and validated through automated tests, data-contract checks, and manual review. No runtime LLM features are included in the deployed application.

## Additional documentation

- [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) — caching, query deduplication, retention indexes, logging, benchmarks
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — major tradeoffs
- [`docs/DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md) — table and column reference
- [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) — database setup and loading
