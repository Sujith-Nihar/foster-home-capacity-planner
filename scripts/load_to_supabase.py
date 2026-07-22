#!/usr/bin/env python3
"""Load processed read-model CSVs into Supabase. CLI-only; not imported by the app."""

from __future__ import annotations

import argparse
import json
import logging
import os
import random
import sys
import time
from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any, TypeVar

import pandas as pd
from dotenv import load_dotenv

try:
    from postgrest.exceptions import APIError
except ImportError:  # pragma: no cover - optional typing aid
    APIError = Exception

try:
    from supabase import Client, create_client
except ImportError as error:  # pragma: no cover
    raise SystemExit(
        "Missing dependency 'supabase'. Install with: pip install -r scripts/requirements.txt"
    ) from error

REPO_ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
ETL_SUMMARY_PATH = PROCESSED_DIR / "etl_summary.json"

FORBIDDEN_COLUMNS = {"id_child", "removal_date", "discharge_date"}
JSON_COLUMNS = {"recruitment_reasons", "outreach_reasons"}
BOOLEAN_COLUMNS = {"currently_has_placement", "is_current"}
INTEGER_COLUMNS = {
    "provider_count",
    "child_count",
    "placement_count",
    "current_children_in_care",
    "current_foster_home_children",
    "current_kin_children",
    "current_nonfamily_children",
    "currently_licensed_providers",
    "currently_active_providers",
    "high_recruitment_counties",
    "high_retention_providers",
    "licensed_providers",
    "active_providers",
    "inactive_providers",
    "out_of_county_foster_count",
    "expiring_90_days",
    "expiring_180_days",
    "high_retention_providers",
    "medium_retention_providers",
    "provider_id",
    "days_until_expiration",
    "days_since_last_placement",
    "total_active_days",
    "active_days_last_365",
    "eligible_licensed_days_last_365",
    "min_age",
    "max_age",
    "current_foster_home_children",
    "matching_licensed_providers",
    "matching_active_providers",
    "active_days",
    "new_license_starts",
    "license_expirations",
    "active_provider_count",
    "foster_home_placement_starts",
}

LOGGER = logging.getLogger("load_to_supabase")
T = TypeVar("T")

MAX_RETRIES = 5
BASE_BACKOFF_SECONDS = 1.0
MAX_BACKOFF_SECONDS = 30.0
TRANSIENT_STATUS_CODES = {408, 425, 429, 500, 502, 503, 504}


@dataclass(frozen=True)
class TableSpec:
    name: str
    filename: str
    conflict_columns: tuple[str, ...]
    sort_columns: tuple[str, ...]


TABLE_SPECS: tuple[TableSpec, ...] = (
    TableSpec("dataset_metadata", "dataset_metadata.csv", ("dataset_version",), ("dataset_version",)),
    TableSpec("system_snapshot", "system_snapshot.csv", ("reporting_date",), ("reporting_date",)),
    TableSpec(
        "county_metrics",
        "county_metrics.csv",
        ("county", "reporting_date"),
        ("county", "reporting_date"),
    ),
    TableSpec(
        "county_age_metrics",
        "county_age_metrics.csv",
        ("county", "age_group", "reporting_date"),
        ("county", "age_group", "reporting_date"),
    ),
    TableSpec(
        "provider_metrics",
        "provider_metrics.csv",
        ("provider_id", "reporting_date"),
        ("provider_id", "reporting_date"),
    ),
    TableSpec(
        "provider_activity_periods",
        "provider_activity_periods.csv",
        ("provider_id", "period_start"),
        ("provider_id", "period_start"),
    ),
    TableSpec("monthly_metrics", "monthly_metrics.csv", ("month",), ("month",)),
)


class LoaderError(Exception):
    """Raised when loader validation or execution fails."""


def configure_logging(verbose: bool) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


def load_environment() -> tuple[str, str]:
    load_dotenv(REPO_ROOT / ".env.local", override=False)
    load_dotenv(REPO_ROOT / ".env", override=False)

    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    secret_key = os.getenv("SUPABASE_SECRET_KEY", "").strip()

    missing = [
        name
        for name, value in (
            ("NEXT_PUBLIC_SUPABASE_URL", url),
            ("SUPABASE_SECRET_KEY", secret_key),
        )
        if not value
    ]
    if missing:
        raise LoaderError(
            "Missing required environment variables: "
            + ", ".join(missing)
            + ". Set them in .env.local before loading."
        )

    return url, secret_key


def is_transient_error(error: Exception) -> bool:
    if isinstance(error, (TimeoutError, ConnectionError, OSError)):
        return True

    if isinstance(error, APIError):
        message = str(error).lower()
        return any(token in message for token in ("timeout", "temporarily", "connection"))

    message = str(error).lower()
    if any(token in message for token in ("timeout", "connection reset", "temporarily unavailable")):
        return True

    for code in TRANSIENT_STATUS_CODES:
        if str(code) in message:
            return True

    return False


def with_retry(operation: Callable[[], T], description: str) -> T:
    last_error: Exception | None = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return operation()
        except Exception as error:  # noqa: BLE001 - classify transient API failures
            if not is_transient_error(error) or attempt == MAX_RETRIES:
                raise
            last_error = error
            delay = min(
                MAX_BACKOFF_SECONDS,
                BASE_BACKOFF_SECONDS * (2 ** (attempt - 1)) + random.uniform(0, 0.25),
            )
            LOGGER.warning(
                "Transient error during %s (attempt %d/%d): %s. Retrying in %.1fs.",
                description,
                attempt,
                MAX_RETRIES,
                error,
                delay,
            )
            time.sleep(delay)

    raise LoaderError(f"Retry loop exited unexpectedly while {description}") from last_error


def read_etl_summary() -> dict[str, Any]:
    if not ETL_SUMMARY_PATH.exists():
        raise LoaderError(f"Missing ETL summary file: {ETL_SUMMARY_PATH}")
    return json.loads(ETL_SUMMARY_PATH.read_text(encoding="utf-8"))


def assert_privacy_contract(csv_path: Path) -> None:
    header = pd.read_csv(csv_path, nrows=0)
    forbidden = FORBIDDEN_COLUMNS.intersection(header.columns)
    if forbidden:
        raise LoaderError(
            f"Privacy contract violation in {csv_path.name}: forbidden columns {sorted(forbidden)}"
        )


def normalize_value(column: str, value: object) -> object:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if column in JSON_COLUMNS and isinstance(value, str):
        return json.loads(value)
    if column in BOOLEAN_COLUMNS:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            lowered = value.strip().lower()
            if lowered in {"true", "t", "1"}:
                return True
            if lowered in {"false", "f", "0"}:
                return False
        return bool(value)
    if column in INTEGER_COLUMNS and value is not None and not pd.isna(value):
        return int(value)
    if isinstance(value, pd.Timestamp):
        return value.date().isoformat()
    return value


def read_table_rows(spec: TableSpec) -> list[dict[str, Any]]:
    csv_path = PROCESSED_DIR / spec.filename
    if not csv_path.exists():
        raise LoaderError(f"Missing processed file: {csv_path}")

    assert_privacy_contract(csv_path)
    frame = pd.read_csv(csv_path)
    frame = frame.sort_values(list(spec.sort_columns), kind="mergesort").reset_index(drop=True)

    rows: list[dict[str, Any]] = []
    for record in frame.to_dict(orient="records"):
        rows.append(
            {column: normalize_value(column, value) for column, value in record.items()}
        )
    return rows


def validate_expected_counts(
    table_names: Sequence[str],
    actual_counts: dict[str, int],
    expected_counts: dict[str, int],
) -> None:
    mismatches: list[str] = []
    for table_name in table_names:
        expected = expected_counts.get(table_name)
        if expected is None:
            mismatches.append(f"{table_name}: missing expected count in etl_summary.json")
            continue
        actual = actual_counts[table_name]
        if actual != expected:
            mismatches.append(f"{table_name}: expected {expected}, found {actual} in CSV")

    if mismatches:
        raise LoaderError("Processed row-count validation failed:\n  - " + "\n  - ".join(mismatches))


def create_supabase_client(url: str, secret_key: str) -> Client:
    return create_client(url, secret_key)


def upsert_batch(
    client: Client,
    spec: TableSpec,
    rows: list[dict[str, Any]],
    batch_size: int,
) -> int:
    if not rows:
        return 0

    conflict = ",".join(spec.conflict_columns)
    uploaded = 0

    for start in range(0, len(rows), batch_size):
        batch = rows[start : start + batch_size]

        def _upsert() -> None:
            response = (
                client.table(spec.name)
                .upsert(batch, on_conflict=conflict, ignore_duplicates=False)
                .execute()
            )
            if getattr(response, "error", None):
                raise LoaderError(f"Upsert failed for {spec.name}: {response.error}")

        with_retry(_upsert, f"upsert {spec.name} rows {start + 1}-{start + len(batch)}")
        uploaded += len(batch)
        LOGGER.info("Upserted %d/%d rows into %s", uploaded, len(rows), spec.name)

    return uploaded


def fetch_table_count(client: Client, table_name: str) -> int:
    def _count() -> int:
        response = client.table(table_name).select("*", count="exact", head=True).execute()
        if response.count is None:
            raise LoaderError(f"Could not verify row count for {table_name}")
        return int(response.count)

    return with_retry(_count, f"count {table_name}")


def verify_database_counts(
    client: Client,
    table_names: Sequence[str],
    expected_counts: dict[str, int],
) -> dict[str, int]:
    verified: dict[str, int] = {}
    mismatches: list[str] = []

    for table_name in table_names:
        db_count = fetch_table_count(client, table_name)
        verified[table_name] = db_count
        expected = expected_counts[table_name]
        if db_count != expected:
            mismatches.append(f"{table_name}: database has {db_count}, expected {expected}")

    if mismatches:
        raise LoaderError("Post-load verification failed:\n  - " + "\n  - ".join(mismatches))

    return verified


def select_tables(table_name: str | None) -> list[TableSpec]:
    if table_name is None:
        return list(TABLE_SPECS)

    matches = [spec for spec in TABLE_SPECS if spec.name == table_name]
    if not matches:
        valid = ", ".join(spec.name for spec in TABLE_SPECS)
        raise LoaderError(f"Unknown table {table_name!r}. Valid tables: {valid}")
    return matches


def run_loader(
    *,
    dry_run: bool,
    table_name: str | None,
    batch_size: int,
) -> dict[str, Any]:
    specs = select_tables(table_name)
    summary = read_etl_summary()
    expected_counts = summary["output_row_counts"]

    table_rows: dict[str, list[dict[str, Any]]] = {}
    actual_counts: dict[str, int] = {}

    for spec in specs:
        rows = read_table_rows(spec)
        table_rows[spec.name] = rows
        actual_counts[spec.name] = len(rows)

    validate_expected_counts([spec.name for spec in specs], actual_counts, expected_counts)

    result: dict[str, Any] = {
        "dry_run": dry_run,
        "tables": [spec.name for spec in specs],
        "csv_row_counts": actual_counts,
        "expected_row_counts": {name: expected_counts[name] for name in actual_counts},
        "reporting_date": summary.get("reporting_date"),
        "source_hash": summary.get("source_hashes", {}).get("combined"),
    }

    if dry_run:
        LOGGER.info("Dry run complete. No database writes performed.")
        return result

    url, secret_key = load_environment()
    client = create_supabase_client(url, secret_key)
    uploaded_counts: dict[str, int] = {}

    for spec in specs:
        uploaded_counts[spec.name] = upsert_batch(
            client,
            spec,
            table_rows[spec.name],
            batch_size,
        )

    db_counts = verify_database_counts(
        client,
        [spec.name for spec in specs],
        expected_counts,
    )

    result["uploaded_row_counts"] = uploaded_counts
    result["database_row_counts"] = db_counts
    return result


def print_summary(result: dict[str, Any]) -> None:
    mode = "DRY RUN" if result["dry_run"] else "LOAD COMPLETE"
    print(mode)
    print(f"Reporting date: {result.get('reporting_date')}")
    if result.get("source_hash"):
        print(f"Source hash: {result['source_hash']}")

    print("Tables:")
    for table_name in result["tables"]:
        csv_count = result["csv_row_counts"][table_name]
        expected = result["expected_row_counts"][table_name]
        line = f"  {table_name}: csv={csv_count} expected={expected}"
        if not result["dry_run"]:
            uploaded = result["uploaded_row_counts"][table_name]
            db_count = result["database_row_counts"][table_name]
            line += f" uploaded={uploaded} database={db_count}"
        print(line)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Load processed foster-home capacity read models into Supabase.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate processed files and counts without writing to Supabase.",
    )
    parser.add_argument(
        "--table",
        dest="table_name",
        help="Load a single table by name.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=500,
        help="Number of rows per upsert batch (default: 500).",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug logging.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    configure_logging(args.verbose)

    if args.batch_size < 1:
        LOGGER.error("--batch-size must be at least 1")
        return 1

    try:
        result = run_loader(
            dry_run=args.dry_run,
            table_name=args.table_name,
            batch_size=args.batch_size,
        )
    except LoaderError as error:
        LOGGER.error("%s", error)
        return 1
    except Exception as error:  # noqa: BLE001 - CLI boundary
        LOGGER.exception("Loader failed: %s", error)
        return 1

    print_summary(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
