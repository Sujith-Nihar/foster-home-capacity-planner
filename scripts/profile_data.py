#!/usr/bin/env python3
"""Profile and validate raw foster-home capacity source CSVs."""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = REPO_ROOT / "data" / "raw"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
PROFILE_OUTPUT = PROCESSED_DIR / "data_profile.json"

REPORTING_DATE = "2026-07-01"
SOURCE_DATE_FORMAT = "%m/%d/%y"

PROVIDER_COLUMNS = [
    "id_provider",
    "license_start_date",
    "license_end_date",
    "county_provider",
    "n_days_licensed",
    "n_days_active",
    "min_age",
    "max_age",
]

CHILD_COLUMNS = [
    "id_child",
    "removal_date",
    "discharge_date",
    "age_at_removal",
    "most_recent_age",
    "removal_county",
]

PLACEMENT_COLUMNS = [
    "id_child",
    "placement_start_date",
    "placement_end_date",
    "resource_type_on_this_placement",
    "placement_index",
    "removal_county",
    "placement_county",
    "id_provider",
    "placement_length",
]

EXPECTED_ROW_COUNTS = {
    "providers": 6_063,
    "children": 16_139,
    "placements": 51_994,
}

COUNTY_NORMALIZATION_MAP = {
    "Vermillion": "Vermilion",
    "De Witt": "DeWitt",
}

COUNTY_COLUMNS = {
    "providers": ["county_provider"],
    "children": ["removal_county"],
    "placements": ["removal_county", "placement_county"],
}


class DataContractError(Exception):
    """Raised when one or more source-data contract checks fail."""

    def __init__(self, violations: list[str]) -> None:
        self.violations = violations
        message = "Data contract validation failed:\n" + "\n".join(
            f"  - {violation}" for violation in violations
        )
        super().__init__(message)


@dataclass(frozen=True)
class CheckResult:
    name: str
    passed: bool
    details: dict[str, Any]

    def as_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "status": "passed" if self.passed else "failed",
            "details": self.details,
        }


def parse_source_date(series: pd.Series) -> pd.Series:
    """Parse source dates using month/day/two-digit-year format."""
    parsed = pd.to_datetime(series, format=SOURCE_DATE_FORMAT, errors="coerce")
    if parsed.isna().any():
        invalid_count = int(parsed.isna().sum())
        raise DataContractError(
            [f"Date parsing failed for {invalid_count} values using {SOURCE_DATE_FORMAT!r}."]
        )
    return parsed


def normalize_county(value: object) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip()
    return COUNTY_NORMALIZATION_MAP.get(text, text)


def is_null_provider_id(value: object) -> bool:
    if value is None:
        return True
    if isinstance(value, float) and pd.isna(value):
        return True
    if isinstance(value, str) and value.strip().upper() in {"", "NA", "N/A", "NULL"}:
        return True
    return False


def load_raw_tables(raw_dir: Path = RAW_DIR) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    provider_path = raw_dir / "provider_level_updated.csv"
    child_path = raw_dir / "child_level.csv"
    placement_path = raw_dir / "placement_level.csv"

    for path in (provider_path, child_path, placement_path):
        if not path.exists():
            raise FileNotFoundError(f"Missing required source file: {path}")

    providers = pd.read_csv(provider_path, dtype={"county_provider": "string"})
    children = pd.read_csv(child_path, dtype={"removal_county": "string"})
    placements = pd.read_csv(
        placement_path,
        dtype={
            "removal_county": "string",
            "placement_county": "string",
            "resource_type_on_this_placement": "string",
        },
        keep_default_na=True,
        na_values=["NA", "N/A", "null", "NULL", ""],
    )
    return providers, children, placements


def _check_required_columns(
    frame: pd.DataFrame,
    expected_columns: list[str],
    table_name: str,
) -> CheckResult:
    actual = list(frame.columns)
    missing = [column for column in expected_columns if column not in actual]
    extra = [column for column in actual if column not in expected_columns]
    passed = not missing and actual == expected_columns
    return CheckResult(
        name=f"{table_name}_required_columns",
        passed=passed,
        details={
            "expected": expected_columns,
            "actual": actual,
            "missing": missing,
            "extra": extra,
        },
    )


def _check_row_counts(
    providers: pd.DataFrame,
    children: pd.DataFrame,
    placements: pd.DataFrame,
) -> CheckResult:
    actual = {
        "providers": len(providers),
        "children": len(children),
        "placements": len(placements),
    }
    passed = actual == EXPECTED_ROW_COUNTS
    return CheckResult(
        name="expected_row_counts",
        passed=passed,
        details={"expected": EXPECTED_ROW_COUNTS, "actual": actual},
    )


def _check_unique_provider_ids(providers: pd.DataFrame) -> CheckResult:
    duplicate_count = int(providers["id_provider"].duplicated().sum())
    return CheckResult(
        name="unique_provider_ids",
        passed=duplicate_count == 0,
        details={
            "duplicate_count": duplicate_count,
            "unique_count": int(providers["id_provider"].nunique()),
        },
    )


def _check_unique_child_ids(children: pd.DataFrame) -> CheckResult:
    duplicate_count = int(children["id_child"].duplicated().sum())
    return CheckResult(
        name="unique_child_ids",
        passed=duplicate_count == 0,
        details={
            "duplicate_count": duplicate_count,
            "unique_count": int(children["id_child"].nunique()),
        },
    )


def _check_unique_child_placement_index_pairs(placements: pd.DataFrame) -> CheckResult:
    duplicate_count = int(placements.duplicated(["id_child", "placement_index"]).sum())
    return CheckResult(
        name="unique_child_placement_index_pairs",
        passed=duplicate_count == 0,
        details={"duplicate_pair_count": duplicate_count},
    )


def _check_sequential_placement_indices(placements: pd.DataFrame) -> CheckResult:
    offenders: list[dict[str, Any]] = []
    offender_count = 0
    for child_id, group in placements.groupby("id_child", sort=False):
        indices = sorted(int(value) for value in group["placement_index"].tolist())
        expected = list(range(1, len(indices) + 1))
        if indices != expected:
            offender_count += 1
            if len(offenders) < 5:
                offenders.append(
                    {
                        "id_child": int(child_id),
                        "indices": indices[:10],
                        "expected_prefix": expected[:10],
                    }
                )

    return CheckResult(
        name="sequential_placement_indices_per_child",
        passed=offender_count == 0,
        details={
            "offender_count": offender_count,
            "sample_offenders": offenders,
        },
    )


def _check_date_parsing(
    providers: pd.DataFrame,
    children: pd.DataFrame,
    placements: pd.DataFrame,
) -> CheckResult:
    date_columns = {
        "providers.license_start_date": providers["license_start_date"],
        "providers.license_end_date": providers["license_end_date"],
        "children.removal_date": children["removal_date"],
        "children.discharge_date": children["discharge_date"],
        "placements.placement_start_date": placements["placement_start_date"],
        "placements.placement_end_date": placements["placement_end_date"],
    }

    failures: dict[str, int] = {}
    for label, series in date_columns.items():
        non_null = series[series.notna() & (series.astype(str).str.strip() != "")]
        if non_null.empty:
            continue
        parsed = pd.to_datetime(non_null, format=SOURCE_DATE_FORMAT, errors="coerce")
        invalid_count = int(parsed.isna().sum())
        if invalid_count:
            failures[label] = invalid_count

    return CheckResult(
        name="source_date_parsing",
        passed=not failures,
        details={"date_format": SOURCE_DATE_FORMAT, "invalid_counts": failures},
    )


def _check_placement_length(placements: pd.DataFrame) -> CheckResult:
    starts = parse_source_date(placements["placement_start_date"])
    ends = parse_source_date(placements["placement_end_date"])
    expected = (ends - starts).dt.days
    mismatch_mask = placements["placement_length"] != expected
    mismatch_count = int(mismatch_mask.sum())
    sample = placements.loc[mismatch_mask, ["id_child", "placement_index", "placement_length"]].head(5)
    return CheckResult(
        name="placement_length_equals_date_difference",
        passed=mismatch_count == 0,
        details={
            "mismatch_count": mismatch_count,
            "sample_mismatches": sample.to_dict(orient="records"),
        },
    )


def _check_placement_children_join(
    children: pd.DataFrame,
    placements: pd.DataFrame,
) -> CheckResult:
    child_ids = set(children["id_child"].tolist())
    orphan_ids = sorted(
        {
            int(child_id)
            for child_id in placements.loc[~placements["id_child"].isin(child_ids), "id_child"].unique()
        }
    )
    return CheckResult(
        name="placement_children_join",
        passed=not orphan_ids,
        details={
            "orphan_placement_child_count": len(orphan_ids),
            "sample_orphan_child_ids": orphan_ids[:10],
        },
    )


def _check_foster_home_provider_join(
    providers: pd.DataFrame,
    placements: pd.DataFrame,
) -> CheckResult:
    foster = placements[placements["resource_type_on_this_placement"] == "foster_home"].copy()
    provider_ids = set(providers["id_provider"].tolist())
    foster_provider_ids = pd.to_numeric(foster["id_provider"], errors="coerce")
    missing_mask = ~foster_provider_ids.isin(provider_ids)
    missing_count = int(missing_mask.sum())
    sample = foster.loc[missing_mask, ["id_child", "placement_index", "id_provider"]].head(5)
    return CheckResult(
        name="foster_home_provider_join",
        passed=missing_count == 0,
        details={
            "foster_home_placement_count": int(len(foster)),
            "missing_provider_join_count": missing_count,
            "sample_missing_rows": sample.to_dict(orient="records"),
        },
    )


def _check_kin_provider_ids_null(placements: pd.DataFrame) -> CheckResult:
    kin = placements[placements["resource_type_on_this_placement"] == "kin"]
    non_null_mask = ~kin["id_provider"].map(is_null_provider_id)
    non_null_count = int(non_null_mask.sum())
    sample = kin.loc[non_null_mask, ["id_child", "placement_index", "id_provider"]].head(5)
    return CheckResult(
        name="kin_provider_ids_null",
        passed=non_null_count == 0,
        details={
            "kin_placement_count": int(len(kin)),
            "non_null_provider_id_count": non_null_count,
            "sample_non_null_rows": sample.to_dict(orient="records"),
        },
    )


def _check_nonfamily_provider_ids_not_in_provider_table(
    providers: pd.DataFrame,
    placements: pd.DataFrame,
) -> CheckResult:
    nonfamily = placements[placements["resource_type_on_this_placement"] == "nonfamily"].copy()
    provider_ids = set(providers["id_provider"].tolist())
    nonfamily_provider_ids = pd.to_numeric(nonfamily["id_provider"], errors="coerce")
    joined_mask = nonfamily_provider_ids.isin(provider_ids)
    joined_count = int(joined_mask.sum())
    sample = nonfamily.loc[joined_mask, ["id_child", "placement_index", "id_provider"]].head(5)
    return CheckResult(
        name="nonfamily_provider_ids_not_in_provider_table",
        passed=joined_count == 0,
        details={
            "nonfamily_placement_count": int(len(nonfamily)),
            "joined_provider_count": joined_count,
            "sample_joined_rows": sample.to_dict(orient="records"),
        },
    )


def _check_current_children_latest_placement_end_date(
    children: pd.DataFrame,
    placements: pd.DataFrame,
) -> CheckResult:
    reporting_date = pd.Timestamp(REPORTING_DATE)
    current_children = children[children["discharge_date"].isna()]["id_child"]
    latest_placements = (
        placements.sort_values(["id_child", "placement_index"])
        .groupby("id_child", as_index=False)
        .tail(1)
    )
    current_latest = latest_placements[latest_placements["id_child"].isin(current_children)].copy()
    end_dates = parse_source_date(current_latest["placement_end_date"])
    mismatch_mask = end_dates != reporting_date
    mismatch_count = int(mismatch_mask.sum())
    sample = current_latest.loc[mismatch_mask, ["id_child", "placement_index", "placement_end_date"]].head(5)
    return CheckResult(
        name="current_children_latest_placement_end_date",
        passed=mismatch_count == 0,
        details={
            "current_child_count": int(current_children.nunique()),
            "mismatch_count": mismatch_count,
            "expected_end_date": REPORTING_DATE,
            "sample_mismatches": sample.to_dict(orient="records"),
        },
    )


def _check_provider_age_bounds(providers: pd.DataFrame) -> CheckResult:
    invalid_mask = providers["min_age"] > providers["max_age"]
    invalid_count = int(invalid_mask.sum())
    sample = providers.loc[invalid_mask, ["id_provider", "min_age", "max_age"]].head(5)
    return CheckResult(
        name="provider_min_age_not_greater_than_max_age",
        passed=invalid_count == 0,
        details={
            "invalid_count": invalid_count,
            "sample_invalid_rows": sample.to_dict(orient="records"),
        },
    )


def _check_provider_licensed_days(providers: pd.DataFrame) -> CheckResult:
    starts = parse_source_date(providers["license_start_date"])
    ends = parse_source_date(providers["license_end_date"])
    expected = (ends - starts).dt.days
    mismatch_mask = providers["n_days_licensed"] != expected
    mismatch_count = int(mismatch_mask.sum())
    sample = providers.loc[mismatch_mask, ["id_provider", "n_days_licensed"]].head(5)
    return CheckResult(
        name="provider_n_days_licensed_equals_license_interval",
        passed=mismatch_count == 0,
        details={
            "mismatch_count": mismatch_count,
            "sample_mismatches": sample.to_dict(orient="records"),
        },
    )


def _check_foster_placement_county_matches_provider_county(
    providers: pd.DataFrame,
    placements: pd.DataFrame,
) -> CheckResult:
    foster = placements[placements["resource_type_on_this_placement"] == "foster_home"].copy()
    foster["id_provider"] = pd.to_numeric(foster["id_provider"], errors="coerce")
    merged = foster.merge(
        providers[["id_provider", "county_provider"]],
        on="id_provider",
        how="left",
        validate="m:1",
    )
    merged["normalized_provider_county"] = merged["county_provider"].map(normalize_county)
    merged["normalized_placement_county"] = merged["placement_county"].map(normalize_county)
    mismatch_mask = merged["normalized_provider_county"] != merged["normalized_placement_county"]
    mismatch_count = int(mismatch_mask.sum())
    sample = merged.loc[
        mismatch_mask,
        ["id_child", "placement_index", "county_provider", "placement_county"],
    ].head(5)
    return CheckResult(
        name="foster_placement_county_matches_provider_county",
        passed=mismatch_count == 0,
        details={
            "foster_home_placement_count": int(len(foster)),
            "mismatch_count": mismatch_count,
            "sample_mismatches": sample.to_dict(orient="records"),
        },
    )


def summarize_counties(
    providers: pd.DataFrame,
    children: pd.DataFrame,
    placements: pd.DataFrame,
) -> dict[str, Any]:
    county_summary: dict[str, Any] = {"normalization_map": COUNTY_NORMALIZATION_MAP, "tables": {}}

    for table_name, columns in COUNTY_COLUMNS.items():
        frame = {"providers": providers, "children": children, "placements": placements}[table_name]
        table_summary: dict[str, Any] = {}
        for column in columns:
            values = frame[column].dropna().astype(str)
            normalization_counts = {
                raw: int((values == raw).sum()) for raw in COUNTY_NORMALIZATION_MAP
            }
            table_summary[column] = {
                "unique_raw_count": int(values.nunique()),
                "unique_normalized_count": int(values.map(normalize_county).nunique()),
                "normalization_counts": normalization_counts,
                "top_values": values.value_counts().head(10).astype(int).to_dict(),
            }
        county_summary["tables"][table_name] = table_summary

    return county_summary


def summarize_missing_ages(children: pd.DataFrame) -> dict[str, int]:
    missing_either = children["age_at_removal"].isna() | children["most_recent_age"].isna()
    return {
        "missing_age_at_removal": int(children["age_at_removal"].isna().sum()),
        "missing_most_recent_age": int(children["most_recent_age"].isna().sum()),
        "missing_either_age_field": int(missing_either.sum()),
    }


def run_contract_checks(
    providers: pd.DataFrame,
    children: pd.DataFrame,
    placements: pd.DataFrame,
) -> list[CheckResult]:
    return [
        _check_required_columns(providers, PROVIDER_COLUMNS, "providers"),
        _check_required_columns(children, CHILD_COLUMNS, "children"),
        _check_required_columns(placements, PLACEMENT_COLUMNS, "placements"),
        _check_row_counts(providers, children, placements),
        _check_unique_provider_ids(providers),
        _check_unique_child_ids(children),
        _check_unique_child_placement_index_pairs(placements),
        _check_sequential_placement_indices(placements),
        _check_date_parsing(providers, children, placements),
        _check_placement_length(placements),
        _check_placement_children_join(children, placements),
        _check_foster_home_provider_join(providers, placements),
        _check_kin_provider_ids_null(placements),
        _check_nonfamily_provider_ids_not_in_provider_table(providers, placements),
        _check_current_children_latest_placement_end_date(children, placements),
        _check_provider_age_bounds(providers),
        _check_provider_licensed_days(providers),
        _check_foster_placement_county_matches_provider_county(providers, placements),
    ]


def build_profile_report(
    providers: pd.DataFrame,
    children: pd.DataFrame,
    placements: pd.DataFrame,
    checks: list[CheckResult],
) -> dict[str, Any]:
    return {
        "title": "Foster Home Capacity Planner — Raw Data Profile",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "passed",
        "reporting_date": REPORTING_DATE,
        "source_files": {
            "providers": str(RAW_DIR / "provider_level_updated.csv"),
            "children": str(RAW_DIR / "child_level.csv"),
            "placements": str(RAW_DIR / "placement_level.csv"),
        },
        "row_counts": {
            "providers": len(providers),
            "children": len(children),
            "placements": len(placements),
        },
        "placement_type_counts": placements["resource_type_on_this_placement"]
        .value_counts()
        .astype(int)
        .to_dict(),
        "current_child_count": int(children["discharge_date"].isna().sum()),
        "missing_age_counts": summarize_missing_ages(children),
        "county_summary": summarize_counties(providers, children, placements),
        "validations": [check.as_dict() for check in checks],
    }


def validate_and_profile(
    raw_dir: Path = RAW_DIR,
    output_path: Path = PROFILE_OUTPUT,
) -> dict[str, Any]:
    providers, children, placements = load_raw_tables(raw_dir)
    checks = run_contract_checks(providers, children, placements)

    violations = [check.name for check in checks if not check.passed]
    if violations:
        raise DataContractError(violations)

    report = build_profile_report(providers, children, placements, checks)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(report, indent=2, sort_keys=False) + "\n", encoding="utf-8")
    return report


def print_summary(report: dict[str, Any]) -> None:
    print("Data contract validation: PASSED")
    print(f"Profile written to: {PROFILE_OUTPUT}")
    print(
        "Row counts:",
        f"providers={report['row_counts']['providers']:,},",
        f"children={report['row_counts']['children']:,},",
        f"placements={report['row_counts']['placements']:,}",
    )
    missing = report["missing_age_counts"]
    print(
        "Missing ages:",
        f"age_at_removal={missing['missing_age_at_removal']},",
        f"most_recent_age={missing['missing_most_recent_age']}",
    )
    print("County normalizations:")
    for table_name, columns in report["county_summary"]["tables"].items():
        for column_name, details in columns.items():
            counts = details["normalization_counts"]
            formatted = ", ".join(f"{raw}→{COUNTY_NORMALIZATION_MAP[raw]}={count}" for raw, count in counts.items())
            print(f"  {table_name}.{column_name}: {formatted}")


def main() -> int:
    try:
        report = validate_and_profile()
    except DataContractError as error:
        print(str(error), file=sys.stderr)
        return 1
    except FileNotFoundError as error:
        print(str(error), file=sys.stderr)
        return 1

    print_summary(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
