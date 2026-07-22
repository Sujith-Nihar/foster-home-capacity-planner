from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import pytest

from profile_data import (
    EXPECTED_ROW_COUNTS,
    PROFILE_OUTPUT,
    REPORTING_DATE,
    SOURCE_DATE_FORMAT,
    DataContractError,
    build_profile_report,
    is_null_provider_id,
    load_raw_tables,
    normalize_county,
    parse_source_date,
    run_contract_checks,
    validate_and_profile,
)


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"


def test_parse_source_date_accepts_source_format() -> None:
    series = pd.Series(["12/9/23", "7/1/26", "3/29/25"])
    parsed = parse_source_date(series)
    assert parsed.dt.strftime("%Y-%m-%d").tolist() == [
        "2023-12-09",
        "2026-07-01",
        "2025-03-29",
    ]


def test_parse_source_date_rejects_invalid_values() -> None:
    with pytest.raises(DataContractError):
        parse_source_date(pd.Series(["not-a-date"]))


def test_normalize_county_applies_documented_map() -> None:
    assert normalize_county("Vermillion") == "Vermilion"
    assert normalize_county("De Witt") == "DeWitt"
    assert normalize_county("Adams") == "Adams"


def test_is_null_provider_id() -> None:
    assert is_null_provider_id(None)
    assert is_null_provider_id(float("nan"))
    assert is_null_provider_id("NA")
    assert not is_null_provider_id(500001)


def test_source_data_contract_passes() -> None:
    providers, children, placements = load_raw_tables(RAW_DIR)
    checks = run_contract_checks(providers, children, placements)
    failed = [check.name for check in checks if not check.passed]
    assert failed == [], f"Failed checks: {failed}"


def test_source_row_counts_match_spec() -> None:
    providers, children, placements = load_raw_tables(RAW_DIR)
    assert len(providers) == EXPECTED_ROW_COUNTS["providers"]
    assert len(children) == EXPECTED_ROW_COUNTS["children"]
    assert len(placements) == EXPECTED_ROW_COUNTS["placements"]


def test_profiler_writes_human_readable_report(tmp_path: Path) -> None:
    output_path = tmp_path / "data_profile.json"
    report = validate_and_profile(raw_dir=RAW_DIR, output_path=output_path)

    assert output_path.exists()
    loaded = json.loads(output_path.read_text(encoding="utf-8"))
    assert loaded["status"] == "passed"
    assert loaded["reporting_date"] == REPORTING_DATE
    assert loaded["row_counts"] == EXPECTED_ROW_COUNTS
    assert loaded["missing_age_counts"]["missing_age_at_removal"] == 6
    assert loaded["missing_age_counts"]["missing_most_recent_age"] == 6
    assert len(loaded["validations"]) == 18
    assert report["status"] == "passed"


def test_profiler_fails_on_missing_columns() -> None:
    providers, children, placements = load_raw_tables(RAW_DIR)
    broken_children = children.drop(columns=["removal_county"])
    checks = run_contract_checks(providers, broken_children, placements)
    failed = [check.name for check in checks if not check.passed]
    assert "children_required_columns" in failed


def test_profiler_fails_on_duplicate_child_ids() -> None:
    providers, children, placements = load_raw_tables(RAW_DIR)
    broken_children = pd.concat([children, children.iloc[[0]]], ignore_index=True)
    checks = run_contract_checks(providers, broken_children, placements)
    child_check = next(check for check in checks if check.name == "unique_child_ids")
    assert not child_check.passed


def test_profiler_fails_on_non_sequential_placement_indices() -> None:
    providers, children, placements = load_raw_tables(RAW_DIR)
    broken_placements = placements.copy()
    broken_placements.loc[broken_placements.index[0], "placement_index"] = 99
    checks = run_contract_checks(providers, children, broken_placements)
    seq_check = next(
        check for check in checks if check.name == "sequential_placement_indices_per_child"
    )
    assert not seq_check.passed


def test_county_normalization_counts_present_in_report() -> None:
    providers, children, placements = load_raw_tables(RAW_DIR)
    checks = run_contract_checks(providers, children, placements)
    report = build_profile_report(providers, children, placements, checks)

    provider_counts = report["county_summary"]["tables"]["providers"]["county_provider"][
        "normalization_counts"
    ]
    assert provider_counts["Vermillion"] == 21
    assert provider_counts["De Witt"] == 46

    placement_counts = report["county_summary"]["tables"]["placements"]["placement_county"][
        "normalization_counts"
    ]
    assert placement_counts["Vermillion"] == 111
    assert placement_counts["De Witt"] == 304


def test_default_profile_output_path_is_processed_directory() -> None:
    assert PROFILE_OUTPUT == ROOT / "data" / "processed" / "data_profile.json"


def test_date_format_constant_matches_source_files() -> None:
    placements = load_raw_tables(RAW_DIR)[2]
    sample = placements["placement_end_date"].dropna().head(100)
    parsed = pd.to_datetime(sample, format=SOURCE_DATE_FORMAT, errors="coerce")
    assert parsed.notna().all()
