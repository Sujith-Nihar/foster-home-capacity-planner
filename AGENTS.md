# AGENTS.md

## Project context

This repository contains the Foster Home Capacity Planner, a decision-support application for Illinois DCFS staff.

Before modifying code, read:

- `docs/PROJECT_SPEC.md`
- `docs/ARCHITECTURE.md`

These documents are the source of truth for product requirements, architecture, data definitions, privacy rules and metric calculations.

## Current implementation status

The project has been completed through Prompt 11:

- Project foundation
- Data profiling and validation
- ETL pipeline
- ETL and privacy tests
- Supabase schema
- Processed-data loader
- Typed data-access layer
- Application shell and design system
- Overview page
- Recruitment page
- County-detail page

Do not rewrite validated ETL logic, database schemas or shared architecture unless a demonstrated bug or requirement requires it.

## Architecture rules

Use:

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Supabase PostgreSQL
- Python and Pandas for ETL

Use Server Components for data fetching by default.

Use Client Components only for browser interactions such as filters, charts, tooltips and responsive controls.

Do not add:

- Express
- FastAPI
- Another backend service
- Authentication
- Runtime LLM features
- Predictive machine learning
- Mock data when real processed data exists

Query Supabase through the typed server data layer. Do not duplicate database queries directly inside UI components.

## Data rules

Always use the fixed reporting date:
2026-07-01