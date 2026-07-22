"""Foster Home Capacity Planner ETL entry point."""

from __future__ import annotations

import json
import logging
import sys

import pandas as pd

from scripts.etl.config import REPORTING_TS
from scripts.etl.intervals import build_provider_merged_intervals
from scripts.etl.normalization import apply_county_normalization
from scripts.etl.outputs import (
    build_dataset_metadata,
    hash_source_files,
    write_etl_summary,
    write_processed_outputs,
)
from scripts.etl.recruitment import (
    build_county_metrics,
    build_current_placement_totals,
    build_monthly_metrics,
    build_system_snapshot,
)
from scripts.etl.retention import build_provider_metrics
from scripts.etl.schemas import add_latest_placement_flags, load_sources, split_placement_types


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


def run_etl() -> dict[str, object]:
    logger = logging.getLogger("scripts.etl.main")
    logger.info("Starting ETL")

    sources = load_sources()
    providers = sources.providers
    children = sources.children
    placements = sources.placements

    providers, provider_norm_counts = apply_county_normalization(
        providers,
        ["county_provider"],
        "providers",
    )
    children, child_norm_counts = apply_county_normalization(
        children,
        ["removal_county"],
        "children",
    )
    placements, placement_norm_counts = apply_county_normalization(
        placements,
        ["removal_county", "placement_county"],
        "placements",
    )

    placements = add_latest_placement_flags(placements)
    placement_splits = split_placement_types(placements)
    foster_placements = placement_splits["foster_home"]

    current_children = children[children["discharge_date"].isna()].copy()
    current_latest = placements[placements["is_latest_placement"] & placements["id_child"].isin(current_children["id_child"])]

    placement_totals = build_current_placement_totals(current_latest)
    logger.info("Current placement-type totals: %s", placement_totals)

    merged_intervals = build_provider_merged_intervals(foster_placements)
    provider_metrics, provider_activity_periods = build_provider_metrics(
        providers,
        foster_placements,
        merged_intervals,
    )

    licensed_mask = (providers["license_start_date"] <= REPORTING_TS) & (
        providers["license_end_date"] > REPORTING_TS
    )
    licensed_providers = providers.loc[licensed_mask].copy()
    active_provider_ids = set(
        foster_placements.loc[foster_placements["placement_end_date"] == REPORTING_TS, "id_provider"]
        .dropna()
        .astype(int)
        .tolist()
    )

    county_metrics, county_age_metrics, thresholds = build_county_metrics(
        current_children,
        current_latest,
        licensed_providers,
        active_provider_ids,
        provider_metrics,
    )
    monthly_metrics = build_monthly_metrics(providers, foster_placements, merged_intervals)
    system_snapshot = build_system_snapshot(
        placement_totals,
        len(licensed_providers),
        len(active_provider_ids),
        county_metrics,
        provider_metrics,
    )

    source_hashes = hash_source_files()
    dataset_metadata = build_dataset_metadata(
        provider_count=len(providers),
        child_count=len(children),
        placement_count=len(placements),
        source_hashes=source_hashes,
    )

    output_counts = write_processed_outputs(
        dataset_metadata,
        system_snapshot,
        county_metrics,
        county_age_metrics,
        provider_metrics,
        provider_activity_periods,
        monthly_metrics,
    )

    recruitment_distribution = (
        county_metrics["recruitment_priority"].value_counts().sort_index().to_dict()
    )
    retention_distribution = (
        provider_metrics["outreach_priority"].value_counts().sort_index().to_dict()
    )

    summary = write_etl_summary(
        row_counts={
            "providers": len(providers),
            "children": len(children),
            "placements": len(placements),
            **output_counts,
        },
        placement_totals=placement_totals,
        thresholds=thresholds,
        recruitment_distribution=recruitment_distribution,
        retention_distribution=retention_distribution,
        county_normalization_counts={
            "providers": provider_norm_counts,
            "children": child_norm_counts,
            "placements": placement_norm_counts,
        },
        source_hashes=source_hashes,
    )

    logger.info("ETL completed successfully")
    return summary


def print_run_report(summary: dict[str, object]) -> None:
    print("ETL status: PASSED")
    print("Output row counts:")
    for name, count in sorted(summary["output_row_counts"].items()):  # type: ignore[index]
        print(f"  {name}: {count}")

    print("Current placement totals:")
    for name, count in summary["current_placement_totals"].items():  # type: ignore[union-attr]
        print(f"  {name}: {count}")

    print("Recruitment percentile thresholds (eligible counties):")
    print(json.dumps(summary["recruitment_percentile_thresholds"], indent=2, sort_keys=True))

    print("Recruitment priority distribution:")
    for priority, count in sorted(summary["recruitment_priority_distribution"].items()):  # type: ignore[union-attr]
        print(f"  {priority}: {count}")

    print("Retention priority distribution:")
    for priority, count in sorted(summary["retention_priority_distribution"].items()):  # type: ignore[union-attr]
        print(f"  {priority}: {count}")


def main() -> int:
    configure_logging()
    try:
        summary = run_etl()
    except Exception as error:  # noqa: BLE001 - top-level CLI boundary
        logging.getLogger("scripts.etl.main").exception("ETL failed: %s", error)
        return 1

    print_run_report(summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
