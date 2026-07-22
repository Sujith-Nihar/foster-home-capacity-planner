"""ETL configuration constants."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = REPO_ROOT / "data" / "raw"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"

PROVIDER_SOURCE = RAW_DIR / "provider_level_updated.csv"
CHILD_SOURCE = RAW_DIR / "child_level.csv"
PLACEMENT_SOURCE = RAW_DIR / "placement_level.csv"

ETL_VERSION = "1.0.0"
DATASET_VERSION = "2026-07-01"
REPORTING_DATE = "2026-07-01"
RECENT_WINDOW_START = "2025-07-01"
SOURCE_DATE_FORMAT = "%m/%d/%y"

REPORTING_TS = datetime.fromisoformat(f"{REPORTING_DATE}T00:00:00")
RECENT_WINDOW_START_TS = datetime.fromisoformat(f"{RECENT_WINDOW_START}T00:00:00")

COUNTY_NORMALIZATION_MAP: dict[str, str] = {
    "Vermillion": "Vermilion",
    "De Witt": "DeWitt",
}

AGE_GROUPS: tuple[dict[str, object], ...] = (
    {"label": "0–5", "min": 0, "max": 5},
    {"label": "6–12", "min": 6, "max": 12},
    {"label": "13–17", "min": 13, "max": 17},
    {"label": "Unknown", "min": None, "max": None},
)

AGE_GROUP_ORDER: tuple[str, ...] = tuple(group["label"] for group in AGE_GROUPS)  # type: ignore[misc]

PLACEMENT_TYPES: tuple[str, ...] = ("foster_home", "kin", "nonfamily")

RECRUITMENT_MIN_FOSTER_CHILDREN = 10
RECRUITMENT_MIN_ACTIVE_PROVIDERS = 3

RETENTION_THRESHOLDS = {
    "high_inactivity_days": 180,
    "high_expiration_days": 90,
    "high_inactivity_with_expiration_days": 60,
    "high_engagement_rate_max": 0.10,
    "medium_inactivity_days": 90,
    "medium_expiration_days": 180,
    "medium_engagement_rate_max": 0.25,
    "medium_active_expiration_days": 60,
    "min_eligible_licensed_days": 90,
}

LICENSE_EXPIRATION_WINDOWS = {
    "days_90": 90,
    "days_180": 180,
}

OUTPUT_FILES = {
    "dataset_metadata": PROCESSED_DIR / "dataset_metadata.csv",
    "system_snapshot": PROCESSED_DIR / "system_snapshot.csv",
    "county_metrics": PROCESSED_DIR / "county_metrics.csv",
    "county_age_metrics": PROCESSED_DIR / "county_age_metrics.csv",
    "provider_metrics": PROCESSED_DIR / "provider_metrics.csv",
    "provider_activity_periods": PROCESSED_DIR / "provider_activity_periods.csv",
    "monthly_metrics": PROCESSED_DIR / "monthly_metrics.csv",
    "etl_summary": PROCESSED_DIR / "etl_summary.json",
}

DATASET_METADATA_COLUMNS = [
    "dataset_version",
    "reporting_date",
    "generated_at",
    "provider_source_hash",
    "child_source_hash",
    "placement_source_hash",
    "source_hash",
    "etl_version",
    "provider_count",
    "child_count",
    "placement_count",
]

SYSTEM_SNAPSHOT_COLUMNS = [
    "reporting_date",
    "current_children_in_care",
    "current_foster_home_children",
    "current_kin_children",
    "current_nonfamily_children",
    "currently_licensed_providers",
    "currently_active_providers",
    "high_recruitment_counties",
    "high_retention_providers",
]

COUNTY_METRICS_COLUMNS = [
    "county",
    "reporting_date",
    "current_children_in_care",
    "current_foster_home_children",
    "current_kin_children",
    "current_nonfamily_children",
    "licensed_providers",
    "active_providers",
    "inactive_providers",
    "children_per_active_provider",
    "out_of_county_foster_count",
    "out_of_county_foster_rate",
    "expiring_90_days",
    "expiring_180_days",
    "high_retention_providers",
    "medium_retention_providers",
    "highest_pressure_age_group",
    "recruitment_priority",
    "recruitment_reasons",
]

COUNTY_AGE_METRICS_COLUMNS = [
    "county",
    "age_group",
    "reporting_date",
    "current_foster_home_children",
    "matching_licensed_providers",
    "matching_active_providers",
    "children_per_matching_active_provider",
]

PROVIDER_METRICS_COLUMNS = [
    "provider_id",
    "county",
    "reporting_date",
    "license_start_date",
    "license_end_date",
    "days_until_expiration",
    "currently_has_placement",
    "last_completed_placement_end",
    "days_since_last_placement",
    "total_active_days",
    "active_days_last_365",
    "eligible_licensed_days_last_365",
    "engagement_rate_last_365",
    "min_age",
    "max_age",
    "outreach_priority",
    "outreach_reasons",
]

PROVIDER_ACTIVITY_COLUMNS = [
    "provider_id",
    "period_start",
    "period_end",
    "active_days",
    "is_current",
]

MONTHLY_METRICS_COLUMNS = [
    "month",
    "new_license_starts",
    "license_expirations",
    "active_provider_count",
    "foster_home_placement_starts",
]
