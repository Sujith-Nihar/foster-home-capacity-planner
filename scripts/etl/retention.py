"""Retention metrics and outreach priority classification."""

from __future__ import annotations

import json
import logging
from typing import Any

import pandas as pd

from scripts.etl.config import (
    PROVIDER_ACTIVITY_COLUMNS,
    PROVIDER_METRICS_COLUMNS,
    RECENT_WINDOW_START_TS,
    REPORTING_DATE,
    REPORTING_TS,
    RETENTION_THRESHOLDS,
)
from scripts.etl.intervals import (
    get_last_completed_period_end,
    sum_days_in_window,
    validate_merged_days_against_source,
)

logger = logging.getLogger(__name__)


def _format_date(value: pd.Timestamp | pd.NaT) -> str | None:
    if pd.isna(value):
        return None
    return pd.Timestamp(value).strftime("%Y-%m-%d")


def classify_outreach_priority(row: pd.Series) -> tuple[str, list[str]]:
    reasons: list[str] = []
    currently_active = bool(row["currently_has_placement"])
    days_since = int(row["days_since_last_placement"])
    days_until_expiration = int(row["days_until_expiration"])
    engagement = row["engagement_rate_last_365"]
    eligible_days = int(row["eligible_licensed_days_last_365"])

    if not currently_active and days_since >= RETENTION_THRESHOLDS["high_inactivity_days"]:
        reasons.append("Inactive for at least 180 days")

    if (
        not currently_active
        and days_until_expiration <= RETENTION_THRESHOLDS["high_expiration_days"]
        and days_since >= RETENTION_THRESHOLDS["high_inactivity_with_expiration_days"]
    ):
        reasons.append(
            "Inactive with license expiring within 90 days and inactive for at least 60 days"
        )

    if (
        not currently_active
        and pd.notna(engagement)
        and eligible_days >= RETENTION_THRESHOLDS["min_eligible_licensed_days"]
        and engagement < RETENTION_THRESHOLDS["high_engagement_rate_max"]
    ):
        reasons.append(
            "Very low engagement while inactive with at least 90 eligible licensed days"
        )

    if reasons:
        return "High", reasons

    if not currently_active and days_since >= RETENTION_THRESHOLDS["medium_inactivity_days"]:
        reasons.append("Inactive for at least 90 days")

    if (
        not currently_active
        and days_until_expiration <= RETENTION_THRESHOLDS["medium_expiration_days"]
    ):
        reasons.append("Inactive with license expiring within 180 days")

    if (
        pd.notna(engagement)
        and eligible_days >= RETENTION_THRESHOLDS["min_eligible_licensed_days"]
        and engagement < RETENTION_THRESHOLDS["medium_engagement_rate_max"]
    ):
        reasons.append("Engagement below 25% with at least 90 eligible licensed days")

    if (
        currently_active
        and pd.notna(engagement)
        and eligible_days >= RETENTION_THRESHOLDS["min_eligible_licensed_days"]
        and engagement < RETENTION_THRESHOLDS["high_engagement_rate_max"]
    ):
        reasons.append("Currently active with very low annual engagement")

    if (
        currently_active
        and days_until_expiration <= RETENTION_THRESHOLDS["medium_active_expiration_days"]
    ):
        reasons.append("Currently active with license expiring within 60 days")

    if reasons:
        return "Medium", reasons

    return "Low", ["No elevated outreach signals at the reporting date"]


def build_provider_metrics(
    providers: pd.DataFrame,
    foster_placements: pd.DataFrame,
    merged_intervals: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    validate_merged_days_against_source(providers, merged_intervals)

    licensed_mask = (providers["license_start_date"] <= REPORTING_TS) & (
        providers["license_end_date"] > REPORTING_TS
    )
    licensed = providers.loc[licensed_mask].copy()

    current_provider_ids = set(
        foster_placements.loc[
            foster_placements["placement_end_date"] == REPORTING_TS, "id_provider"
        ].dropna()
        .astype(int)
        .tolist()
    )

    interval_map = {
        provider_id: frame
        for provider_id, frame in merged_intervals.groupby("provider_id", sort=True)
    }

    rows: list[dict[str, Any]] = []
    for provider in licensed.sort_values("id_provider").itertuples(index=False):
        provider_id = int(provider.id_provider)
        provider_intervals = interval_map.get(provider_id, pd.DataFrame())
        intervals = [
            (row.period_start.to_pydatetime(), row.period_end.to_pydatetime())
            for row in provider_intervals.itertuples(index=False)
        ]

        currently_has_placement = provider_id in current_provider_ids
        total_active_days = int(provider_intervals["active_days"].sum()) if not provider_intervals.empty else 0
        active_days_last_365 = sum_days_in_window(
            intervals,
            RECENT_WINDOW_START_TS,
            REPORTING_TS,
        )
        eligible_licensed_days_last_365 = sum_days_in_window(
            [
                (
                    provider.license_start_date.to_pydatetime(),
                    provider.license_end_date.to_pydatetime(),
                )
            ],
            RECENT_WINDOW_START_TS,
            REPORTING_TS,
        )

        engagement_rate = (
            active_days_last_365 / eligible_licensed_days_last_365
            if eligible_licensed_days_last_365 > 0
            else pd.NA
        )

        last_completed_end = get_last_completed_period_end(
            provider_intervals,
            currently_has_placement,
        )

        if currently_has_placement:
            days_since_last_placement = 0
        elif pd.isna(last_completed_end):
            days_since_last_placement = pd.NA
        else:
            days_since_last_placement = (REPORTING_TS - last_completed_end).days

        days_until_expiration = (provider.license_end_date - REPORTING_TS).days

        metric_row = {
            "provider_id": provider_id,
            "county": provider.county_provider,
            "reporting_date": REPORTING_DATE,
            "license_start_date": _format_date(provider.license_start_date),
            "license_end_date": _format_date(provider.license_end_date),
            "days_until_expiration": days_until_expiration,
            "currently_has_placement": currently_has_placement,
            "last_completed_placement_end": _format_date(last_completed_end),
            "days_since_last_placement": days_since_last_placement,
            "total_active_days": total_active_days,
            "active_days_last_365": active_days_last_365,
            "eligible_licensed_days_last_365": eligible_licensed_days_last_365,
            "engagement_rate_last_365": engagement_rate,
            "min_age": int(provider.min_age),
            "max_age": int(provider.max_age),
        }

        priority, reasons = classify_outreach_priority(pd.Series(metric_row))
        metric_row["outreach_priority"] = priority
        metric_row["outreach_reasons"] = json.dumps(reasons, ensure_ascii=True)

        rows.append(metric_row)

    provider_metrics = pd.DataFrame(rows, columns=PROVIDER_METRICS_COLUMNS)
    activity_periods = merged_intervals.loc[
        merged_intervals["provider_id"].isin(licensed["id_provider"])
    ].copy()
    activity_periods["period_start"] = activity_periods["period_start"].dt.strftime("%Y-%m-%d")
    activity_periods["period_end"] = activity_periods["period_end"].dt.strftime("%Y-%m-%d")
    activity_periods = activity_periods.sort_values(
        ["provider_id", "period_start"],
        kind="mergesort",
    ).reset_index(drop=True)
    activity_periods = activity_periods[PROVIDER_ACTIVITY_COLUMNS]

    logger.info("Built provider metrics for %d currently licensed providers", len(provider_metrics))
    return provider_metrics, activity_periods
