"""Write processed outputs and ETL summary artifacts."""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd

from scripts.etl.config import (
    CHILD_SOURCE,
    DATASET_METADATA_COLUMNS,
    DATASET_VERSION,
    ETL_VERSION,
    MONTHLY_METRICS_COLUMNS,
    OUTPUT_FILES,
    PLACEMENT_SOURCE,
    PROCESSED_DIR,
    PROVIDER_SOURCE,
    REPORTING_DATE,
)

logger = logging.getLogger(__name__)

FORBIDDEN_OUTPUT_COLUMNS = {
    "id_child",
    "removal_date",
    "discharge_date",
}


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def combined_source_hash(*hashes: str) -> str:
    combined = "|".join(hashes)
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()


def assert_no_child_identifiers(frames: dict[str, pd.DataFrame]) -> None:
    violations: list[str] = []
    for name, frame in frames.items():
        forbidden = FORBIDDEN_OUTPUT_COLUMNS.intersection(frame.columns)
        if forbidden:
            violations.append(f"{name} contains forbidden columns: {sorted(forbidden)}")

    if violations:
        raise ValueError("Privacy contract violation:\n" + "\n".join(f"  - {item}" for item in violations))


def write_csv(frame: pd.DataFrame, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(path, index=False, lineterminator="\n")
    logger.info("Wrote %s (%d rows)", path.name, len(frame))


def build_dataset_metadata(
    provider_count: int,
    child_count: int,
    placement_count: int,
    source_hashes: dict[str, str],
) -> pd.DataFrame:
    generated_at = datetime.now(timezone.utc).isoformat()
    metadata = {
        "dataset_version": DATASET_VERSION,
        "reporting_date": REPORTING_DATE,
        "generated_at": generated_at,
        "provider_source_hash": source_hashes["providers"],
        "child_source_hash": source_hashes["children"],
        "placement_source_hash": source_hashes["placements"],
        "source_hash": source_hashes["combined"],
        "etl_version": ETL_VERSION,
        "provider_count": provider_count,
        "child_count": child_count,
        "placement_count": placement_count,
    }
    return pd.DataFrame([metadata], columns=DATASET_METADATA_COLUMNS)


def write_processed_outputs(
    dataset_metadata: pd.DataFrame,
    system_snapshot: pd.DataFrame,
    county_metrics: pd.DataFrame,
    county_age_metrics: pd.DataFrame,
    provider_metrics: pd.DataFrame,
    provider_activity_periods: pd.DataFrame,
    monthly_metrics: pd.DataFrame,
) -> dict[str, int]:
    frames = {
        "dataset_metadata": dataset_metadata,
        "system_snapshot": system_snapshot,
        "county_metrics": county_metrics,
        "county_age_metrics": county_age_metrics,
        "provider_metrics": provider_metrics,
        "provider_activity_periods": provider_activity_periods,
        "monthly_metrics": monthly_metrics,
    }
    assert_no_child_identifiers(frames)

    write_csv(dataset_metadata, OUTPUT_FILES["dataset_metadata"])
    write_csv(system_snapshot, OUTPUT_FILES["system_snapshot"])
    write_csv(county_metrics, OUTPUT_FILES["county_metrics"])
    write_csv(county_age_metrics, OUTPUT_FILES["county_age_metrics"])
    write_csv(provider_metrics, OUTPUT_FILES["provider_metrics"])
    write_csv(provider_activity_periods, OUTPUT_FILES["provider_activity_periods"])
    write_csv(monthly_metrics[MONTHLY_METRICS_COLUMNS], OUTPUT_FILES["monthly_metrics"])

    return {name: len(frame) for name, frame in frames.items()}


def write_etl_summary(
    row_counts: dict[str, int],
    placement_totals: dict[str, int],
    thresholds: dict[str, dict[str, float | None]],
    recruitment_distribution: dict[str, int],
    retention_distribution: dict[str, int],
    county_normalization_counts: dict[str, dict[str, dict[str, int]]],
    source_hashes: dict[str, str],
) -> dict[str, Any]:
    summary: dict[str, Any] = {
        "status": "passed",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "reporting_date": REPORTING_DATE,
        "etl_version": ETL_VERSION,
        "source_hashes": source_hashes,
        "input_row_counts": {
            "providers": row_counts["providers"],
            "children": row_counts["children"],
            "placements": row_counts["placements"],
        },
        "output_row_counts": {
            key: value
            for key, value in row_counts.items()
            if key not in {"providers", "children", "placements"}
        },
        "current_placement_totals": placement_totals,
        "recruitment_percentile_thresholds": thresholds,
        "recruitment_priority_distribution": recruitment_distribution,
        "retention_priority_distribution": retention_distribution,
        "county_normalization_counts": county_normalization_counts,
        "output_files": {key: str(path) for key, path in OUTPUT_FILES.items()},
    }

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILES["etl_summary"].write_text(
        json.dumps(summary, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    logger.info("Wrote %s", OUTPUT_FILES["etl_summary"].name)
    return summary


def hash_source_files() -> dict[str, str]:
    provider_hash = sha256_file(PROVIDER_SOURCE)
    child_hash = sha256_file(CHILD_SOURCE)
    placement_hash = sha256_file(PLACEMENT_SOURCE)
    return {
        "providers": provider_hash,
        "children": child_hash,
        "placements": placement_hash,
        "combined": combined_source_hash(provider_hash, child_hash, placement_hash),
    }
