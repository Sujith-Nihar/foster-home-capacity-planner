"""Source loading and schema helpers."""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from scripts.etl.config import (
    CHILD_SOURCE,
    PLACEMENT_SOURCE,
    PROVIDER_SOURCE,
    REPORTING_TS,
    SOURCE_DATE_FORMAT,
)


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


@dataclass(frozen=True)
class SourceTables:
    providers: pd.DataFrame
    children: pd.DataFrame
    placements: pd.DataFrame


def parse_source_date(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, format=SOURCE_DATE_FORMAT, errors="raise")


def _parse_optional_dates(series: pd.Series) -> pd.Series:
    non_null = series.notna() & (series.astype(str).str.strip() != "")
    parsed = pd.Series(pd.NaT, index=series.index, dtype="datetime64[ns]")
    if non_null.any():
        parsed.loc[non_null] = parse_source_date(series.loc[non_null])
    return parsed


def load_sources() -> SourceTables:
    providers = pd.read_csv(PROVIDER_SOURCE, dtype={"county_provider": "string"})
    children = pd.read_csv(CHILD_SOURCE, dtype={"removal_county": "string"})
    placements = pd.read_csv(
        PLACEMENT_SOURCE,
        dtype={
            "removal_county": "string",
            "placement_county": "string",
            "resource_type_on_this_placement": "string",
        },
        keep_default_na=True,
        na_values=["NA", "N/A", "null", "NULL", ""],
    )

    providers["license_start_date"] = parse_source_date(providers["license_start_date"])
    providers["license_end_date"] = parse_source_date(providers["license_end_date"])

    children["removal_date"] = parse_source_date(children["removal_date"])
    children["discharge_date"] = _parse_optional_dates(children["discharge_date"])

    placements["placement_start_date"] = parse_source_date(placements["placement_start_date"])
    placements["placement_end_date"] = parse_source_date(placements["placement_end_date"])
    placements["id_provider"] = pd.to_numeric(placements["id_provider"], errors="coerce").astype("Int64")

    return SourceTables(providers=providers, children=children, placements=placements)


def add_latest_placement_flags(placements: pd.DataFrame) -> pd.DataFrame:
    ranked = placements.sort_values(["id_child", "placement_index"]).copy()
    ranked["is_latest_placement"] = ~ranked.duplicated("id_child", keep="last")
    ranked["is_current_placement"] = ranked["is_latest_placement"] & (
        ranked["placement_end_date"] == REPORTING_TS
    )
    return ranked


def split_placement_types(placements: pd.DataFrame) -> dict[str, pd.DataFrame]:
    return {
        placement_type: placements[
            placements["resource_type_on_this_placement"] == placement_type
        ].copy()
        for placement_type in ("foster_home", "kin", "nonfamily")
    }
