"""County and age normalization helpers."""

from __future__ import annotations

import logging
from typing import Any

import pandas as pd

from scripts.etl.config import AGE_GROUPS, COUNTY_NORMALIZATION_MAP

logger = logging.getLogger(__name__)


def normalize_county(value: object) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip()
    if not text:
        return None
    return COUNTY_NORMALIZATION_MAP.get(text, text)


def normalize_county_column(series: pd.Series) -> tuple[pd.Series, dict[str, int]]:
    counts = {raw: int((series == raw).sum()) for raw in COUNTY_NORMALIZATION_MAP}
    normalized = series.map(normalize_county)
    return normalized, counts


def apply_county_normalization(
    frame: pd.DataFrame,
    columns: list[str],
    table_name: str,
) -> tuple[pd.DataFrame, dict[str, dict[str, int]]]:
    normalized_frame = frame.copy()
    table_counts: dict[str, dict[str, int]] = {}

    for column in columns:
        normalized, counts = normalize_county_column(normalized_frame[column])
        normalized_frame[column] = normalized
        table_counts[column] = counts
        for raw_value, count in counts.items():
            if count:
                logger.info(
                    "Normalized county value %r -> %r (%d rows) in %s.%s",
                    raw_value,
                    COUNTY_NORMALIZATION_MAP[raw_value],
                    count,
                    table_name,
                    column,
                )

    return normalized_frame, table_counts


def assign_age_group(age: object) -> str:
    if age is None or (isinstance(age, float) and pd.isna(age)):
        return "Unknown"

    age_value = int(age)
    for group in AGE_GROUPS:
        if group["label"] == "Unknown":
            continue
        group_min = group["min"]
        group_max = group["max"]
        assert isinstance(group_min, int)
        assert isinstance(group_max, int)
        if group_min <= age_value <= group_max:
            return str(group["label"])

    return "Unknown"


def provider_matches_age_group(min_age: int, max_age: int, group: dict[str, Any]) -> bool:
    if group["label"] == "Unknown":
        return False
    group_min = group["min"]
    group_max = group["max"]
    assert isinstance(group_min, int)
    assert isinstance(group_max, int)
    return min_age <= group_max and max_age >= group_min
