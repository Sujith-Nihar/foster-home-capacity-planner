"""Integration tests for the full ETL pipeline and processed outputs."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import pytest

from scripts.etl.config import AGE_GROUP_ORDER, OUTPUT_FILES, PROCESSED_DIR
from scripts.etl.intervals import build_provider_merged_intervals, validate_merged_days_against_source
from scripts.etl.main import run_etl
from scripts.etl.outputs import FORBIDDEN_OUTPUT_COLUMNS
from scripts.etl.schemas import load_sources

ROOT = Path(__file__).resolve().parents[1]
PROCESSED_CSVS = [
    "dataset_metadata.csv",
    "system_snapshot.csv",
    "county_metrics.csv",
    "county_age_metrics.csv",
    "provider_metrics.csv",
    "provider_activity_periods.csv",
    "monthly_metrics.csv",
]


@pytest.fixture(scope="module")
def etl_outputs() -> dict[str, pd.DataFrame]:
    summary = run_etl()
    assert summary["status"] == "passed"
    return {
        path.stem: pd.read_csv(PROCESSED_DIR / path.name) for path in OUTPUT_FILES.values() if path.suffix == ".csv"
    }


class TestRealDatasetValidation:
    def test_provider_full_merged_days_equal_n_days_active(self) -> None:
        sources = load_sources()
        placements = sources.placements
        foster = placements[placements["resource_type_on_this_placement"] == "foster_home"].copy()
        merged = build_provider_merged_intervals(foster)
        validate_merged_days_against_source(sources.providers, merged)


class TestPrivacyContract:
    def test_child_ids_absent_from_every_public_output(self, etl_outputs: dict[str, pd.DataFrame]) -> None:
        for name, frame in etl_outputs.items():
            forbidden = FORBIDDEN_OUTPUT_COLUMNS.intersection(frame.columns)
            assert not forbidden, f"{name} contains forbidden columns: {sorted(forbidden)}"


class TestDeterministicOutputOrdering:
    def test_county_metrics_sorted_alphabetically(self, etl_outputs: dict[str, pd.DataFrame]) -> None:
        counties = etl_outputs["county_metrics"]["county"].tolist()
        assert counties == sorted(counties)

    def test_provider_metrics_sorted_by_provider_id(self, etl_outputs: dict[str, pd.DataFrame]) -> None:
        provider_ids = etl_outputs["provider_metrics"]["provider_id"].tolist()
        assert provider_ids == sorted(provider_ids)

    def test_provider_activity_periods_sorted_deterministically(
        self,
        etl_outputs: dict[str, pd.DataFrame],
    ) -> None:
        activity = etl_outputs["provider_activity_periods"]
        expected = activity.sort_values(
            ["provider_id", "period_start"],
            kind="mergesort",
        ).reset_index(drop=True)
        pd.testing.assert_frame_equal(activity.reset_index(drop=True), expected)

    def test_county_age_metrics_sorted_by_county_and_age_group(
        self,
        etl_outputs: dict[str, pd.DataFrame],
    ) -> None:
        age_metrics = etl_outputs["county_age_metrics"]
        counties = age_metrics["county"].tolist()
        assert counties == sorted(counties)
        observed_order = age_metrics.groupby("county", sort=True)["age_group"].apply(list)
        for groups in observed_order:
            assert groups == list(AGE_GROUP_ORDER)

    def test_monthly_metrics_sorted_by_month(self, etl_outputs: dict[str, pd.DataFrame]) -> None:
        months = etl_outputs["monthly_metrics"]["month"].tolist()
        assert months == sorted(months)

    def test_etl_summary_matches_processed_row_counts(self, etl_outputs: dict[str, pd.DataFrame]) -> None:
        summary = json.loads((PROCESSED_DIR / "etl_summary.json").read_text(encoding="utf-8"))
        for name, frame in etl_outputs.items():
            assert summary["output_row_counts"][name] == len(frame)


class TestProcessedArtifactsExist:
    def test_all_processed_csv_files_exist(self) -> None:
        for path in OUTPUT_FILES.values():
            if path.suffix == ".csv":
                assert path.exists(), f"Missing processed file: {path}"

    def test_system_snapshot_matches_spec_totals(self, etl_outputs: dict[str, pd.DataFrame]) -> None:
        snapshot = etl_outputs["system_snapshot"].iloc[0]
        assert snapshot["current_children_in_care"] == 8071
        assert snapshot["current_foster_home_children"] == 4343
        assert snapshot["current_kin_children"] == 3688
        assert snapshot["current_nonfamily_children"] == 40
        assert snapshot["currently_licensed_providers"] == 3391
        assert snapshot["currently_active_providers"] == 2733
