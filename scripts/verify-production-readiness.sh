#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Python tests"
pytest tests -q

echo "==> ETL data-contract tests"
pytest tests/test_data_contract.py -q

echo "==> ESLint"
npm run lint

echo "==> TypeScript typecheck"
npm run typecheck

echo "==> Vitest"
npm run test

echo "==> Next.js build"
npm run build

echo "==> Playwright smoke tests"
npm run test:e2e

echo "==> Git hygiene checks"
if git ls-files 'data/raw/*.csv' | grep -q .; then
  echo "Raw CSV files must not be committed." >&2
  exit 1
fi

if git ls-files 'data/processed/*.csv' | grep -q .; then
  echo "Processed CSV files must not be committed." >&2
  exit 1
fi

if rg -n "SUPABASE_SECRET_KEY" src >/dev/null 2>&1; then
  echo "SUPABASE_SECRET_KEY must not be referenced in src/." >&2
  exit 1
fi

echo "All verification checks passed."
