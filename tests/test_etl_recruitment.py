"""Unit tests for recruitment metrics and planning priority logic."""

from __future__ import annotations

import pandas as pd

from scripts.etl.config import AGE_GROUPS
from scripts.etl.normalization import assign_age_group, normalize_county, provider_matches_age_group
from scripts.etl.recruitment import classify_recruitment_priority
from tests.etl_helpers import fixed_thresholds, recruitment_metric_row


class TestCountyNormalization:
    def test_documented_county_map_only(self) -> None:
        assert normalize_county("Vermillion") == "Vermilion"
        assert normalize_county("De Witt") == "DeWitt"
        assert normalize_county("Adams") == "Adams"


class TestMissingAgeGrouping:
    def test_missing_age_maps_to_unknown(self) -> None:
        assert assign_age_group(None) == "Unknown"
        assert assign_age_group(float("nan")) == "Unknown"

    def test_known_ages_map_to_documented_groups(self) -> None:
        assert assign_age_group(3) == "0–5"
        assert assign_age_group(8) == "6–12"
        assert assign_age_group(15) == "13–17"


class TestAgePreferenceOverlap:
    def test_zero_to_five_overlap(self) -> None:
        group = AGE_GROUPS[0]
        assert provider_matches_age_group(0, 5, group) is True
        assert provider_matches_age_group(6, 12, group) is False

    def test_six_to_twelve_overlap(self) -> None:
        group = AGE_GROUPS[1]
        assert provider_matches_age_group(4, 8, group) is True
        assert provider_matches_age_group(0, 5, group) is False
        assert provider_matches_age_group(13, 17, group) is False

    def test_thirteen_to_seventeen_overlap(self) -> None:
        group = AGE_GROUPS[2]
        assert provider_matches_age_group(10, 17, group) is True
        assert provider_matches_age_group(0, 12, group) is False


class TestOutOfCountyCalculation:
    def test_normalized_matching_counties_are_not_out_of_county(self) -> None:
        frame = pd.DataFrame(
            {
                "removal_county": ["Vermillion", "De Witt"],
                "placement_county": ["Vermilion", "DeWitt"],
            }
        )
        frame["removal_county"] = frame["removal_county"].map(normalize_county)
        frame["placement_county"] = frame["placement_county"].map(normalize_county)
        frame["is_out_of_county"] = frame["removal_county"] != frame["placement_county"]
        assert frame["is_out_of_county"].tolist() == [False, False]

    def test_different_normalized_counties_are_out_of_county(self) -> None:
        frame = pd.DataFrame(
            {
                "removal_county": ["Adams"],
                "placement_county": ["Cook"],
            }
        )
        frame["is_out_of_county"] = frame["removal_county"] != frame["placement_county"]
        assert frame["is_out_of_county"].tolist() == [True]


class TestRecruitmentPriorityClassification:
    def test_limited_data_when_not_eligible(self) -> None:
        priority, reasons = classify_recruitment_priority(
            recruitment_metric_row(is_eligible=False),
            fixed_thresholds(),
        )
        assert priority == "Limited data"
        assert "minimum volume" in reasons[0]

    def test_high_priority_when_two_indicators_at_or_above_p75(self) -> None:
        priority, reasons = classify_recruitment_priority(
            recruitment_metric_row(
                children_per_active_provider=2.5,
                out_of_county_foster_rate=2.5,
                highest_age_group_pressure=0.5,
            ),
            fixed_thresholds(median=1.0, p75=2.0),
        )
        assert priority == "High"
        assert len([reason for reason in reasons if "75th percentile" in reason]) == 2

    def test_medium_priority_with_one_indicator_at_p75(self) -> None:
        priority, reasons = classify_recruitment_priority(
            recruitment_metric_row(
                children_per_active_provider=2.5,
                out_of_county_foster_rate=0.5,
                highest_age_group_pressure=0.5,
            ),
            fixed_thresholds(median=1.0, p75=2.0),
        )
        assert priority == "Medium"
        assert any("75th percentile" in reason for reason in reasons)

    def test_medium_priority_with_two_indicators_at_median(self) -> None:
        priority, _ = classify_recruitment_priority(
            recruitment_metric_row(
                children_per_active_provider=1.5,
                out_of_county_foster_rate=1.5,
                highest_age_group_pressure=0.5,
            ),
            fixed_thresholds(median=1.0, p75=2.0),
        )
        assert priority == "Medium"

    def test_low_priority_for_eligible_county_below_thresholds(self) -> None:
        priority, reasons = classify_recruitment_priority(
            recruitment_metric_row(
                children_per_active_provider=0.5,
                out_of_county_foster_rate=0.5,
                highest_age_group_pressure=0.5,
            ),
            fixed_thresholds(median=1.0, p75=2.0),
        )
        assert priority == "Low"
        assert "Below statewide comparison thresholds" in reasons[0]
