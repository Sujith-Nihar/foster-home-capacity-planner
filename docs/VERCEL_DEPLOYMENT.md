# Vercel deployment

This guide covers deploying the Foster Home Capacity Planner Next.js application to Vercel.

## What gets deployed

Only the Next.js application in this repository. The Python ETL and Supabase loader run locally or in a separate automation environment; they are **not** executed by Vercel during deployment.

## Prerequisites

1. Supabase project with migrations applied
2. Processed read models loaded into Supabase
3. Vercel project connected to this repository

## Required Vercel environment variables

Set these in **Project → Settings → Environment Variables** for Production (and Preview if you want preview deployments to query Supabase):

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser + server | Example: `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Browser + server | Supabase publishable (anon) key |

### Do not set on Vercel

| Variable | Reason |
| --- | --- |
| `SUPABASE_SECRET_KEY` | Service-role key is for the local loader only. It must never ship with the deployed Next.js app. |

## GitHub Actions secrets (CI)

If using the included workflow, configure repository secrets with the same Supabase values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The CI pipeline uses them for `next build` and Playwright smoke tests.

## Deployment steps

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Use the default Next.js framework preset.
4. Add the required environment variables above.
5. Deploy.

No custom build command is required:

```bash
npm run build
```

Vercel will detect Next.js automatically.

## Post-deploy verification

1. Open `/` and confirm KPI cards load from Supabase.
2. Open `/methodology` and confirm the **Data version** section shows `dataset_metadata`.
3. Exercise `/recruitment`, `/retention`, and a provider detail route.
4. Download a filtered export from `/api/exports/recruitment` and `/api/exports/retention`.
5. Confirm the site responds with `noindex, nofollow` metadata.

## Data refresh workflow

When source CSVs change:

1. Run the ETL locally: `python3 -m scripts.etl.main`
2. Reload processed tables with `python3 scripts/load_to_supabase.py`
3. Redeploy only if application code changed; data updates do not require a redeploy if Supabase already holds the new snapshot

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Blank KPI cards / 500 errors | Missing or incorrect Supabase env vars | Verify URL and publishable key in Vercel settings |
| Playwright fails in CI | Secrets not configured | Add GitHub repository secrets |
| Exports return 500 | Database unreachable or RLS misconfigured | Confirm migrations and loader completed successfully |
| Stale metrics | Old Supabase snapshot | Re-run ETL and loader |

## Security notes

- Keep raw and processed CSV files out of git and off Vercel.
- Use Supabase RLS anonymous `SELECT` policies only on published read models.
- Rotate keys if a secret key is ever exposed; redeploy publishable credentials if needed.
