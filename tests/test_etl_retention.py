"""Unit tests for retention metrics and outreach priority logic."""

from __future__ import annotations

import pandas as pd

from scripts.etl.config import RECENT_WINDOW_START_TS, REPORTING_TS
from scripts.etl.intervals import (
    build_provider_merged_intervals,
    get_last_completed_period_end,
    sum_days_in_window,
)
from scripts.etl.retention import build_provider_metrics, classify_outreach_priority
from scripts.etl.schemas import add_latest_placement_flags
from tests.etl_helpers import (
    foster_placement_row,
    foster_placements_frame,
    provider_row,
    providers_frame,
    retention_metric_row,
    ts,
)


class TestRecentWindowProviderMetrics:
    def test_provider_licensed_fewer_than_365_days(self) -> None:
        eligible_days = sum_days_in_window(
            [(ts("2025-10-01").to_pydatetime(), ts("2027-01-01").to_pydatetime())],
            RECENT_WINDOW_START_TS,
            REPORTING_TS,
        )
        assert eligible_days == (REPORTING_TS - ts("2025-10-01")).days
        assert eligible_days < 365

    def test_provider_license_ending_inside_recent_window_is_clipped(self) -> None:
        eligible_days = sum_days_in_window(
            [(ts("2025-01-01").to_pydatetime(), ts("2026-03-01").to_pydatetime())],
            RECENT_WINDOW_START_TS,
            REPORTING_TS,
        )
        assert eligible_days == (ts("2026-03-01") - ts("2025-07-01")).days


class TestCurrentPlacementIdentification:
    def test_latest_placement_ending_on_reporting_date_is_current(self) -> None:
        placements = pd.DataFrame(
            [
                {
                    "id_child": 100,
                    "placement_start_date": ts("2025-01-01"),
                    "placement_end_date": ts("2025-06-01"),
                    "resource_type_on_this_placement": "foster_home",
                    "placement_index": 1,
                    "removal_county": "Adams",
                    "placement_county": "Adams",
                    "id_provider": 500001,
                    "placement_length": 151,
                },
                {
                    "id_child": 100,
                    "placement_start_date": ts("2025-06-01"),
                    "placement_end_date": ts("2026-07-01"),
                    "resource_type_on_this_placement": "foster_home",
                    "placement_index": 2,
                    "removal_county": "Adams",
                    "placement_county": "Adams",
                    "id_provider": 500001,
                    "placement_length": 395,
                },
            ]
        )
        flagged = add_latest_placement_flags(placements)
        latest = flagged[flagged["is_latest_placement"]]
        assert len(latest) == 1
        assert latest.iloc[0]["placement_index"] == 2
        assert bool(latest.iloc[0]["is_current_placement"]) is True


class TestLastCompletedPlacementLogic:
    def test_active_provider_returns_previous_completed_period(self) -> None:
        intervals = pd.DataFrame(
            [
                {
                    "period_start": ts("2024-01-01"),
                    "period_end": ts("2025-06-01"),
                    "active_days": 517,
                    "is_current": False,
                },
                {
                    "period_start": ts("2025-06-01"),
                    "period_end": ts("2026-07-01"),
                    "active_days": 395,
                    "is_current": True,
                },
            ]
        )
        assert get_last_completed_period_end(intervals, currently_has_placement=True) == ts("2025-06-01")

    def test_active_provider_without_earlier_period_has_null_last_completed_end(self) -> None:
        intervals = pd.DataFrame(
            [
                {
                    "period_start": ts("2025-06-01"),
                    "period_end": ts("2026-07-01"),
                    "active_days": 395,
                    "is_current": True,
                }
            ]
        )
        assert pd.isna(get_last_completed_period_end(intervals, currently_has_placement=True))

    def test_inactive_provider_uses_most_recent_period_end(self) -> None:
        intervals = pd.DataFrame(
            [
                {
                    "period_start": ts("2024-01-01"),
                    "period_end": ts("2025-01-01"),
                    "active_days": 366,
                    "is_current": False,
                },
                {
                    "period_start": ts("2025-01-01"),
                    "period_end": ts("2025-12-01"),
                    "active_days": 334,
                    "is_current": False,
                },
            ]
        )
        assert get_last_completed_period_end(intervals, currently_has_placement=False) == ts("2025-12-01")


class TestDaysSinceLastPlacement:
    def test_active_provider_has_zero_days_since_last_placement(self) -> None:
        providers = providers_frame(
            [
                provider_row(
                    provider_id=500001,
                    license_start="2024-01-01",
                    license_end="2027-01-01",
                    n_days_active=395,
                )
            ]
        )
        placements = foster_placements_frame(
            [
                foster_placement_row(
                    provider_id=500001,
                    start="2025-06-01",
                    end="2026-07-01",
                )
            ]
        )
        merged = build_provider_merged_intervals(placements)
        metrics, _ = build_provider_metrics(providers, placements, merged)
        row = metrics.iloc[0]
        assert bool(row["currently_has_placement"]) is True
        assert row["days_since_last_placement"] == 0

    def test_inactive_provider_counts_days_from_last_completed_end(self) -> None:
        providers = providers_frame(
            [
                provider_row(
                    provider_id=500002,
                    license_start="2024-01-01",
                    license_end="2027-01-01",
                    n_days_active=334,
                )
            ]
        )
        placements = foster_placements_frame(
            [
                foster_placement_row(
                    provider_id=500002,
                    start="2025-01-01",
                    end="2025-12-01",
                )
            ]
        )
        merged = build_provider_merged_intervals(placements)
        metrics, _ = build_provider_metrics(providers, placements, merged)
        row = metrics.iloc[0]
        assert bool(row["currently_has_placement"]) is False
        assert row["days_since_last_placement"] == (REPORTING_TS - ts("2025-12-01")).days


class TestOutreachPriorityClassification:
    def test_high_priority_inactivity(self) -> None:
        priority, reasons = classify_outreach_priority(
            retention_metric_row(days_since_last_placement=180, currently_has_placement=False)
        )
        assert priority == "High"
        assert "Inactive for at least 180 days" in reasons

    def test_medium_priority_active_expiring_soon(self) -> None:
        priority, reasons = classify_outreach_priority(
            retention_metric_row(
                currently_has_placement=True,
                days_since_last_placement=0,
                days_until_expiration=30,
                engagement_rate_last_365=0.8,
            )
        )
        assert priority == "Medium"
        assert "Currently active with license expiring within 60 days" in reasons

    def test_low_priority_without_elevated_signals(self) -> None:
        priority, reasons = classify_outreach_priority(
            retention_metric_row(
                currently_has_placement=True,
                days_since_last_placement=0,
                days_until_expiration=200,
                engagement_rate_last_365=0.8,
            )
        )
        assert priority == "Low"
        assert reasons == ["No elevated outreach signals at the reporting date"]

    def test_high_priority_takes_precedence_over_medium(self) -> None:
        priority, reasons = classify_outreach_priority(
            retention_metric_row(
                currently_has_placement=False,
                days_since_last_placement=200,
                days_until_expiration=150,
                engagement_rate_last_365=0.8,
            )
        )
        assert priority == "High"
        assert "Inactive for at least 180 days" in reasons
        assert "Inactive for at least 90 days" not in reasons


class TestNonfamilyExclusion:
    def test_nonfamily_placements_do_not_affect_provider_retention_metrics(self) -> None:
        providers = providers_frame(
            [
                provider_row(
                    provider_id=500003,
                    license_start="2024-01-01",
                    license_end="2027-01-01",
                    n_days_active=100,
                )
            ]
        )
        foster = foster_placements_frame(
            [
                foster_placement_row(
                    provider_id=500003,
                    start="2025-01-01",
                    end="2025-04-11",
                )
            ]
        )
        nonfamily = pd.DataFrame(
            [
                {
                    "id_child": 200,
                    "placement_start_date": ts("2025-04-11"),
                    "placement_end_date": ts("2026-07-01"),
                    "resource_type_on_this_placement": "nonfamily",
                    "placement_index": 2,
                    "removal_county": "Adams",
                    "placement_county": "Adams",
                    "id_provider": 800001,
                    "placement_length": (ts("2026-07-01") - ts("2025-04-11")).days,
                }
            ]
        )
        placements = pd.concat([foster, nonfamily], ignore_index=True)
        merged = build_provider_merged_intervals(foster)
        metrics, activity = build_provider_metrics(providers, foster, merged)

        assert metrics.iloc[0]["total_active_days"] == 100
        assert bool(metrics.iloc[0]["currently_has_placement"]) is False
        assert 800001 not in activity["provider_id"].tolist()
        assert 800001 not in metrics["provider_id"].tolist()
