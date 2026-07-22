"""Shared helpers for ETL unit tests."""

from __future__ import annotations

import pandas as pd

from scripts.etl.config import REPORTING_TS


def ts(value: str) -> pd.Timestamp:
    return pd.Timestamp(value)


def foster_placement_row(
    *,
    provider_id: int,
    start: str,
    end: str,
    child_id: int = 1,
    placement_index: int = 1,
) -> dict[str, object]:
    start_ts = ts(start)
    end_ts = ts(end)
    return {
        "id_child": child_id,
        "placement_start_date": start_ts,
        "placement_end_date": end_ts,
        "resource_type_on_this_placement": "foster_home",
        "placement_index": placement_index,
        "removal_county": "Adams",
        "placement_county": "Adams",
        "id_provider": provider_id,
        "placement_length": (end_ts - start_ts).days,
    }


def foster_placements_frame(rows: list[dict[str, object]]) -> pd.DataFrame:
    return pd.DataFrame(rows)


def provider_row(
    *,
    provider_id: int,
    license_start: str,
    license_end: str,
    n_days_active: int,
    county: str = "Adams",
    min_age: int = 0,
    max_age: int = 17,
) -> dict[str, object]:
    start_ts = ts(license_start)
    end_ts = ts(license_end)
    return {
        "id_provider": provider_id,
        "license_start_date": start_ts,
        "license_end_date": end_ts,
        "county_provider": county,
        "n_days_licensed": (end_ts - start_ts).days,
        "n_days_active": n_days_active,
        "min_age": min_age,
        "max_age": max_age,
    }


def providers_frame(rows: list[dict[str, object]]) -> pd.DataFrame:
    return pd.DataFrame(rows)


def retention_metric_row(**overrides: object) -> pd.Series:
    base = {
        "currently_has_placement": False,
        "days_since_last_placement": 200,
        "days_until_expiration": 120,
        "engagement_rate_last_365": 0.5,
        "eligible_licensed_days_last_365": 120,
    }
    base.update(overrides)
    return pd.Series(base)


def recruitment_metric_row(**overrides: object) -> pd.Series:
    base = {
        "is_eligible": True,
        "children_per_active_provider": 1.0,
        "out_of_county_foster_rate": 0.5,
        "highest_age_group_pressure": 1.0,
        "expiring_90_days": 0,
    }
    base.update(overrides)
    return pd.Series(base)


def fixed_thresholds(
    *,
    median: float = 1.0,
    p75: float = 2.0,
) -> dict[str, dict[str, float | None]]:
    return {
        "children_per_active_provider": {"median": median, "p75": p75},
        "out_of_county_foster_rate": {"median": median, "p75": p75},
        "highest_age_group_pressure": {"median": median, "p75": p75},
    }


def is_licensed_on_reporting_date(license_start: str, license_end: str) -> bool:
    return ts(license_start) <= REPORTING_TS < ts(license_end)
