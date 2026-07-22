"""Foster-home placement interval utilities."""

from __future__ import annotations

import logging
from datetime import datetime

import pandas as pd

from scripts.etl.config import RECENT_WINDOW_START_TS, REPORTING_TS

logger = logging.getLogger(__name__)


def interval_days(start: datetime, end: datetime) -> int:
    """Return day count for an end-exclusive interval [start, end)."""
    return (pd.Timestamp(end) - pd.Timestamp(start)).days


def merge_intervals(
    intervals: list[tuple[datetime, datetime]],
) -> list[tuple[datetime, datetime]]:
    if not intervals:
        return []

    sorted_intervals = sorted(intervals, key=lambda item: item[0])
    merged: list[tuple[datetime, datetime]] = [sorted_intervals[0]]

    for start, end in sorted_intervals[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))

    return merged


def clip_interval(
    start: datetime,
    end: datetime,
    window_start: datetime,
    window_end: datetime,
) -> tuple[datetime, datetime] | None:
    clip_start = max(start, window_start)
    clip_end = min(end, window_end)
    if clip_start >= clip_end:
        return None
    return clip_start, clip_end


def sum_days_in_window(
    intervals: list[tuple[datetime, datetime]],
    window_start: datetime,
    window_end: datetime,
) -> int:
    total = 0
    for start, end in intervals:
        clipped = clip_interval(start, end, window_start, window_end)
        if clipped is None:
            continue
        total += interval_days(clipped[0], clipped[1])
    return total


def build_provider_merged_intervals(foster_placements: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, object]] = []

    for provider_id, group in foster_placements.groupby("id_provider", sort=True):
        if pd.isna(provider_id):
            continue

        intervals = [
            (row.placement_start_date.to_pydatetime(), row.placement_end_date.to_pydatetime())
            for row in group.itertuples(index=False)
        ]
        merged = merge_intervals(intervals)

        for start, end in merged:
            rows.append(
                {
                    "provider_id": int(provider_id),
                    "period_start": pd.Timestamp(start),
                    "period_end": pd.Timestamp(end),
                    "active_days": interval_days(start, end),
                    "is_current": pd.Timestamp(end) == REPORTING_TS,
                }
            )

    return pd.DataFrame(rows)


def summarize_provider_active_days(merged_intervals: pd.DataFrame) -> pd.DataFrame:
    summary = (
        merged_intervals.groupby("provider_id", as_index=False)["active_days"]
        .sum()
        .rename(columns={"active_days": "merged_active_days"})
    )
    return summary


def validate_merged_days_against_source(
    providers: pd.DataFrame,
    merged_intervals: pd.DataFrame,
) -> None:
    summary = summarize_provider_active_days(merged_intervals)
    comparison = providers[["id_provider", "n_days_active"]].merge(
        summary,
        left_on="id_provider",
        right_on="provider_id",
        how="left",
        validate="1:1",
    )
    comparison["merged_active_days"] = comparison["merged_active_days"].fillna(0).astype(int)
    mismatches = comparison[comparison["n_days_active"] != comparison["merged_active_days"]]

    if not mismatches.empty:
        sample = mismatches.head(5).to_dict(orient="records")
        raise ValueError(
            "Merged foster-home active days do not match n_days_active for "
            f"{len(mismatches)} providers. Sample: {sample}"
        )

    logger.info(
        "Validated merged foster-home active days against n_days_active for %d providers",
        len(comparison),
    )


def get_last_completed_period_end(
    provider_intervals: pd.DataFrame,
    currently_has_placement: bool,
) -> pd.Timestamp | pd.NaT:
    completed = provider_intervals[provider_intervals["period_end"] < REPORTING_TS]
    if completed.empty:
        return pd.NaT

    if currently_has_placement:
        return completed["period_end"].max()

    return provider_intervals["period_end"].max()
