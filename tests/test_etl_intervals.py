"""Unit tests for foster-home interval merging and window clipping."""

from __future__ import annotations

from datetime import datetime

import pandas as pd
import pytest

from scripts.etl.config import RECENT_WINDOW_START_TS, REPORTING_TS
from scripts.etl.intervals import (
    build_provider_merged_intervals,
    interval_days,
    merge_intervals,
    sum_days_in_window,
)
from tests.etl_helpers import foster_placement_row, foster_placements_frame, ts


def _dt(value: str) -> datetime:
    return ts(value).to_pydatetime()


class TestMergeIntervals:
    def test_two_non_overlapping_intervals_remain_separate(self) -> None:
        merged = merge_intervals(
            [
                (_dt("2024-01-01"), _dt("2024-02-01")),
                (_dt("2024-03-01"), _dt("2024-04-01")),
            ]
        )
        assert merged == [
            (_dt("2024-01-01"), _dt("2024-02-01")),
            (_dt("2024-03-01"), _dt("2024-04-01")),
        ]
        assert interval_days(*merged[0]) == 31
        assert interval_days(*merged[1]) == 31

    def test_overlapping_intervals_merge(self) -> None:
        merged = merge_intervals(
            [
                (_dt("2024-01-01"), _dt("2024-03-15")),
                (_dt("2024-03-01"), _dt("2024-05-01")),
            ]
        )
        assert merged == [(_dt("2024-01-01"), _dt("2024-05-01"))]
        assert interval_days(*merged[0]) == 121

    def test_fully_contained_interval_merges_to_outer_span(self) -> None:
        merged = merge_intervals(
            [
                (_dt("2024-01-01"), _dt("2024-06-01")),
                (_dt("2024-02-01"), _dt("2024-03-01")),
            ]
        )
        assert merged == [(_dt("2024-01-01"), _dt("2024-06-01"))]

    def test_adjacent_intervals_merge(self) -> None:
        merged = merge_intervals(
            [
                (_dt("2024-01-01"), _dt("2024-02-01")),
                (_dt("2024-02-01"), _dt("2024-03-01")),
            ]
        )
        assert merged == [(_dt("2024-01-01"), _dt("2024-03-01"))]
        assert interval_days(*merged[0]) == 60


class TestRecentWindowClipping:
    def test_interval_crossing_recent_window_start_is_clipped(self) -> None:
        days = sum_days_in_window(
            [(_dt("2025-01-01"), _dt("2025-12-01"))],
            RECENT_WINDOW_START_TS,
            REPORTING_TS,
        )
        assert days == (ts("2025-12-01") - ts("2025-07-01")).days

    def test_interval_ending_at_reporting_date_counts_through_window_end(self) -> None:
        frame = foster_placements_frame(
            [
                foster_placement_row(
                    provider_id=900001,
                    start="2025-07-01",
                    end="2026-07-01",
                )
            ]
        )
        merged = build_provider_merged_intervals(frame)
        assert len(merged) == 1
        assert bool(merged.iloc[0]["is_current"]) is True
        assert merged.iloc[0]["period_end"] == REPORTING_TS
        assert merged.iloc[0]["active_days"] == 365

    def test_only_recent_window_portion_counts_toward_active_days_last_365(self) -> None:
        days = sum_days_in_window(
            [(_dt("2024-01-01"), _dt("2026-07-01"))],
            RECENT_WINDOW_START_TS,
            REPORTING_TS,
        )
        assert days == 365
