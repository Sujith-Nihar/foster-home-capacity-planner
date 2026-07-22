"""Recruitment county metrics and planning priority classification."""

from __future__ import annotations

import json
import logging
from typing import Any

import pandas as pd

from scripts.etl.config import (
    AGE_GROUP_ORDER,
    AGE_GROUPS,
    COUNTY_AGE_METRICS_COLUMNS,
    COUNTY_METRICS_COLUMNS,
    LICENSE_EXPIRATION_WINDOWS,
    RECRUITMENT_MIN_ACTIVE_PROVIDERS,
    RECRUITMENT_MIN_FOSTER_CHILDREN,
    REPORTING_DATE,
    REPORTING_TS,
    SYSTEM_SNAPSHOT_COLUMNS,
)
from scripts.etl.normalization import assign_age_group, provider_matches_age_group

logger = logging.getLogger(__name__)

INDICATOR_COLUMNS = (
    "children_per_active_provider",
    "out_of_county_foster_rate",
    "highest_age_group_pressure",
)


def _safe_ratio(numerator: float | int, denominator: float | int) -> float | None:
    if denominator == 0:
        return None
    return float(numerator) / float(denominator)


def build_current_placement_totals(current_latest: pd.DataFrame) -> dict[str, int]:
    counts = current_latest["resource_type_on_this_placement"].value_counts()
    return {
        "current_children_in_care": int(len(current_latest)),
        "current_foster_home_children": int(counts.get("foster_home", 0)),
        "current_kin_children": int(counts.get("kin", 0)),
        "current_nonfamily_children": int(counts.get("nonfamily", 0)),
    }


def build_county_age_metrics(
    foster_with_age: pd.DataFrame,
    licensed_providers: pd.DataFrame,
    active_provider_ids: set[int],
) -> pd.DataFrame:
    foster_with_age = foster_with_age.copy()
    foster_with_age["age_group"] = foster_with_age["most_recent_age"].map(assign_age_group)

    counties = sorted(
        set(foster_with_age["removal_county"].dropna().astype(str))
        | set(licensed_providers["county_provider"].dropna().astype(str))
    )

    rows: list[dict[str, Any]] = []
    for county in counties:
        county_children = foster_with_age[foster_with_age["removal_county"] == county]
        county_licensed = licensed_providers[licensed_providers["county_provider"] == county]

        for group in AGE_GROUPS:
            label = str(group["label"])
            if label == "Unknown":
                children_count = int((county_children["age_group"] == "Unknown").sum())
                matching_licensed = 0
                matching_active = 0
                ratio = None
            else:
                children_count = int((county_children["age_group"] == label).sum())
                licensed_matches = county_licensed[
                    county_licensed.apply(
                        lambda row: provider_matches_age_group(
                            int(row["min_age"]),
                            int(row["max_age"]),
                            group,
                        ),
                        axis=1,
                    )
                ]
                matching_licensed = int(len(licensed_matches))
                matching_active = int(
                    licensed_matches["id_provider"].astype(int).isin(active_provider_ids).sum()
                )
                ratio = _safe_ratio(children_count, matching_active)

            rows.append(
                {
                    "county": county,
                    "age_group": label,
                    "reporting_date": REPORTING_DATE,
                    "current_foster_home_children": children_count,
                    "matching_licensed_providers": matching_licensed,
                    "matching_active_providers": matching_active,
                    "children_per_matching_active_provider": ratio,
                }
            )

    frame = pd.DataFrame(rows, columns=COUNTY_AGE_METRICS_COLUMNS)
    frame["age_group"] = pd.Categorical(frame["age_group"], categories=list(AGE_GROUP_ORDER), ordered=True)
    return frame.sort_values(["county", "age_group"], kind="mergesort").reset_index(drop=True)


def _county_age_pressure(county_age_metrics: pd.DataFrame) -> pd.DataFrame:
    measurable = county_age_metrics[
        county_age_metrics["age_group"] != "Unknown"
    ].copy()
    measurable = measurable[measurable["children_per_matching_active_provider"].notna()]

    if measurable.empty:
        return pd.DataFrame(columns=["county", "highest_pressure_age_group", "highest_age_group_pressure"])

    idx = measurable.groupby("county")["children_per_matching_active_provider"].idxmax()
    top = measurable.loc[idx, ["county", "age_group", "children_per_matching_active_provider"]]
    top = top.rename(
        columns={
            "age_group": "highest_pressure_age_group",
            "children_per_matching_active_provider": "highest_age_group_pressure",
        }
    )
    return top.reset_index(drop=True)


def calculate_percentile_thresholds(eligible: pd.DataFrame) -> dict[str, dict[str, float | None]]:
    thresholds: dict[str, dict[str, float | None]] = {}
    for column in INDICATOR_COLUMNS:
        values = eligible[column].dropna()
        if values.empty:
            thresholds[column] = {"median": None, "p75": None}
            continue
        thresholds[column] = {
            "median": float(values.median()),
            "p75": float(values.quantile(0.75)),
        }
    return thresholds


def _indicator_flags(
    value: float | None,
    thresholds: dict[str, dict[str, float | None]],
    column: str,
) -> tuple[bool, bool]:
    if value is None or pd.isna(value):
        return False, False
    median = thresholds[column]["median"]
    p75 = thresholds[column]["p75"]
    at_median = median is not None and value >= median
    at_p75 = p75 is not None and value >= p75
    return at_median, at_p75


def classify_recruitment_priority(
    row: pd.Series,
    thresholds: dict[str, dict[str, float | None]],
) -> tuple[str, list[str]]:
    if not bool(row["is_eligible"]):
        return "Limited data", ["County does not meet minimum volume rules for comparison"]

    reasons: list[str] = []
    at_median_flags: list[bool] = []
    at_p75_flags: list[bool] = []

    indicator_labels = {
        "children_per_active_provider": "children per active provider",
        "out_of_county_foster_rate": "out-of-county foster-home placement rate",
        "highest_age_group_pressure": "age-group pressure",
    }

    for column in INDICATOR_COLUMNS:
        at_median, at_p75 = _indicator_flags(row[column], thresholds, column)
        at_median_flags.append(at_median)
        at_p75_flags.append(at_p75)
        label = indicator_labels[column]
        if at_p75:
            reasons.append(f"Above the 75th percentile statewide for {label}")
        elif at_median:
            reasons.append(f"Above the statewide median for {label}")

    if sum(at_p75_flags) >= 2:
        priority = "High"
    elif sum(at_p75_flags) >= 1 or sum(at_median_flags) >= 2:
        priority = "Medium"
    else:
        priority = "Low"
        if not reasons:
            reasons.append("Below statewide comparison thresholds among eligible counties")

    if row["expiring_90_days"] >= 3:
        reasons.append("Several currently licensed providers approach expiration within 90 days")

    return priority, reasons


def build_county_metrics(
    current_children: pd.DataFrame,
    current_latest: pd.DataFrame,
    licensed_providers: pd.DataFrame,
    active_provider_ids: set[int],
    provider_metrics: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame, dict[str, dict[str, float | None]]]:
    current_children = current_children.copy()
    current_latest = current_latest.copy()

    foster_current = current_latest[
        current_latest["resource_type_on_this_placement"] == "foster_home"
    ].copy()
    kin_current = current_latest[current_latest["resource_type_on_this_placement"] == "kin"]
    nonfamily_current = current_latest[
        current_latest["resource_type_on_this_placement"] == "nonfamily"
    ]

    foster_current = foster_current.merge(
        current_children[["id_child", "most_recent_age"]],
        on="id_child",
        how="left",
    )
    foster_current["is_out_of_county"] = (
        foster_current["removal_county"] != foster_current["placement_county"]
    )

    counties = sorted(
        set(current_children["removal_county"].dropna().astype(str))
        | set(licensed_providers["county_provider"].dropna().astype(str))
    )

    retention_high = (
        provider_metrics[provider_metrics["outreach_priority"] == "High"]
        .groupby("county")
        .size()
    )
    retention_medium = (
        provider_metrics[provider_metrics["outreach_priority"] == "Medium"]
        .groupby("county")
        .size()
    )

    rows: list[dict[str, Any]] = []
    for county in counties:
        county_current_children = current_children[current_children["removal_county"] == county]
        county_foster = foster_current[foster_current["removal_county"] == county]
        county_kin = kin_current[kin_current["removal_county"] == county]
        county_nonfamily = nonfamily_current[nonfamily_current["removal_county"] == county]
        county_licensed = licensed_providers[licensed_providers["county_provider"] == county]

        active_providers = int(
            county_licensed["id_provider"].astype(int).isin(active_provider_ids).sum()
        )
        licensed_count = int(len(county_licensed))
        foster_children = int(len(county_foster))
        out_of_county_count = int(county_foster["is_out_of_county"].sum())

        days_until = (county_licensed["license_end_date"] - REPORTING_TS).dt.days
        expiring_90 = int((days_until <= LICENSE_EXPIRATION_WINDOWS["days_90"]).sum())
        expiring_180 = int((days_until <= LICENSE_EXPIRATION_WINDOWS["days_180"]).sum())

        rows.append(
            {
                "county": county,
                "reporting_date": REPORTING_DATE,
                "current_children_in_care": int(len(county_current_children)),
                "current_foster_home_children": foster_children,
                "current_kin_children": int(len(county_kin)),
                "current_nonfamily_children": int(len(county_nonfamily)),
                "licensed_providers": licensed_count,
                "active_providers": active_providers,
                "inactive_providers": licensed_count - active_providers,
                "children_per_active_provider": _safe_ratio(foster_children, active_providers),
                "out_of_county_foster_count": out_of_county_count,
                "out_of_county_foster_rate": _safe_ratio(out_of_county_count, foster_children),
                "expiring_90_days": expiring_90,
                "expiring_180_days": expiring_180,
                "high_retention_providers": int(retention_high.get(county, 0)),
                "medium_retention_providers": int(retention_medium.get(county, 0)),
            }
        )

    county_metrics = pd.DataFrame(rows)
    county_age_metrics = build_county_age_metrics(
        foster_current,
        licensed_providers,
        active_provider_ids,
    )
    pressure = _county_age_pressure(county_age_metrics)
    county_metrics = county_metrics.merge(pressure, on="county", how="left")

    county_metrics["is_eligible"] = (
        (county_metrics["current_foster_home_children"] >= RECRUITMENT_MIN_FOSTER_CHILDREN)
        & (county_metrics["active_providers"] >= RECRUITMENT_MIN_ACTIVE_PROVIDERS)
        & county_metrics["children_per_active_provider"].notna()
        & county_metrics["out_of_county_foster_rate"].notna()
        & county_metrics["highest_age_group_pressure"].notna()
    )

    eligible = county_metrics[county_metrics["is_eligible"]].copy()
    thresholds = calculate_percentile_thresholds(eligible)

    priorities: list[str] = []
    reasons_col: list[str] = []
    for _, row in county_metrics.iterrows():
        priority, reasons = classify_recruitment_priority(row, thresholds)
        priorities.append(priority)
        reasons_col.append(json.dumps(reasons, ensure_ascii=True))

    county_metrics["recruitment_priority"] = priorities
    county_metrics["recruitment_reasons"] = reasons_col
    county_metrics = county_metrics.drop(columns=["is_eligible"])
    county_metrics = county_metrics[COUNTY_METRICS_COLUMNS].sort_values("county", kind="mergesort")
    county_metrics = county_metrics.reset_index(drop=True)

    logger.info("Built county metrics for %d counties", len(county_metrics))
    return county_metrics, county_age_metrics, thresholds


def build_monthly_metrics(
    providers: pd.DataFrame,
    foster_placements: pd.DataFrame,
    merged_intervals: pd.DataFrame,
) -> pd.DataFrame:
    reporting_ts = pd.Timestamp(REPORTING_TS)
    month_starts = pd.date_range(
        start=min(
            providers["license_start_date"].min(),
            foster_placements["placement_start_date"].min(),
        ).to_period("M").to_timestamp(),
        end=reporting_ts.to_period("M").to_timestamp(),
        freq="MS",
    )

    rows: list[dict[str, int | str]] = []
    for month_start in month_starts:
        month_end = month_start + pd.offsets.MonthBegin(1)
        month_label = month_start.strftime("%Y-%m-01")

        new_license_starts = int(
            (
                (providers["license_start_date"] >= month_start)
                & (providers["license_start_date"] < month_end)
            ).sum()
        )
        license_expirations = int(
            (
                (providers["license_end_date"] >= month_start)
                & (providers["license_end_date"] < month_end)
            ).sum()
        )
        foster_home_placement_starts = int(
            (
                (foster_placements["placement_start_date"] >= month_start)
                & (foster_placements["placement_start_date"] < month_end)
            ).sum()
        )

        overlapping = merged_intervals[
            (merged_intervals["period_start"] < month_end)
            & (merged_intervals["period_end"] > month_start)
        ]
        active_provider_count = int(overlapping["provider_id"].nunique())

        rows.append(
            {
                "month": month_label,
                "new_license_starts": new_license_starts,
                "license_expirations": license_expirations,
                "active_provider_count": active_provider_count,
                "foster_home_placement_starts": foster_home_placement_starts,
            }
        )

    return pd.DataFrame(rows).sort_values("month", kind="mergesort").reset_index(drop=True)


def build_system_snapshot(
    placement_totals: dict[str, int],
    licensed_count: int,
    active_provider_count: int,
    county_metrics: pd.DataFrame,
    provider_metrics: pd.DataFrame,
) -> pd.DataFrame:
    snapshot = {
        "reporting_date": REPORTING_DATE,
        "current_children_in_care": placement_totals["current_children_in_care"],
        "current_foster_home_children": placement_totals["current_foster_home_children"],
        "current_kin_children": placement_totals["current_kin_children"],
        "current_nonfamily_children": placement_totals["current_nonfamily_children"],
        "currently_licensed_providers": licensed_count,
        "currently_active_providers": active_provider_count,
        "high_recruitment_counties": int((county_metrics["recruitment_priority"] == "High").sum()),
        "high_retention_providers": int((provider_metrics["outreach_priority"] == "High").sum()),
    }
    return pd.DataFrame([snapshot], columns=SYSTEM_SNAPSHOT_COLUMNS)
