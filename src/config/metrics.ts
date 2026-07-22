/**
 * Fixed analytical constants for the Foster Home Capacity Planner.
 * All date intervals in the application are end-exclusive.
 */

/** Cutoff date for all current-record logic and published metrics. */
export const REPORTING_DATE = "2026-07-01" as const;

/** Start of the one-year recent activity window (inclusive). */
export const RECENT_WINDOW_START = "2025-07-01" as const;

export type AgeGroupLabel = "0–5" | "6–12" | "13–17" | "Unknown";

export type AgeGroup = {
  label: AgeGroupLabel;
  min: number | null;
  max: number | null;
};

/** Child age groups used for demand and provider-preference matching. */
export const AGE_GROUPS: readonly AgeGroup[] = [
  { label: "0–5", min: 0, max: 5 },
  { label: "6–12", min: 6, max: 12 },
  { label: "13–17", min: 13, max: 17 },
  { label: "Unknown", min: null, max: null },
] as const;

/**
 * Documented county label variants in source data.
 * Keys are raw values; values are normalized names used in joins and display.
 */
export const COUNTY_NORMALIZATION_MAP: Readonly<Record<string, string>> = {
  Vermillion: "Vermilion",
  "De Witt": "DeWitt",
} as const;

/** Minimum county volume required for comparative recruitment priority. */
export const RECRUITMENT_MINIMUM_VOLUME = {
  currentFosterHomeChildren: 10,
  activeProviders: 3,
} as const;

/** Percentile cutoffs used when comparing eligible counties for recruitment priority. */
export const RECRUITMENT_PRIORITY_PERCENTILES = {
  median: 50,
  high: 75,
} as const;

/** Rules for classifying recruitment planning priority among eligible counties. */
export const RECRUITMENT_PRIORITY_RULES = {
  /** At least two indicators at or above the 75th percentile. */
  highMinIndicatorsAt75th: 2,
  /** One indicator at or above the 75th percentile. */
  mediumMinIndicatorsAt75th: 1,
  /** At least two indicators at or above the median. */
  mediumMinIndicatorsAtMedian: 2,
} as const;

/** Retention outreach priority thresholds for currently licensed providers. */
export const RETENTION_THRESHOLDS = {
  /** High: inactive for at least this many days. */
  highInactivityDays: 180,
  /** High: inactive with license expiring within this many days. */
  highExpirationDays: 90,
  /** High: minimum inactivity when license is nearing expiration. */
  highInactivityWithExpirationDays: 60,
  /** High: engagement rate below this decimal (10%). */
  highEngagementRateMax: 0.1,
  /** Medium: inactive for at least this many days. */
  mediumInactivityDays: 90,
  /** Medium: inactive with license expiring within this many days. */
  mediumExpirationDays: 180,
  /** Medium: engagement rate below this decimal (25%). */
  mediumEngagementRateMax: 0.25,
  /** Medium: active provider license expiring within this many days. */
  mediumActiveExpirationDays: 60,
  /** Minimum eligible licensed days required for engagement-based rules. */
  minEligibleLicensedDays: 90,
} as const;

/** License expiration exposure windows used in recruitment county metrics. */
export const LICENSE_EXPIRATION_WINDOWS = {
  days90: 90,
  days180: 180,
} as const;

/** Validated source dataset facts (for reference in UI copy and validation). */
export const SOURCE_DATA_FACTS = {
  reportingDate: REPORTING_DATE,
  providerCount: 6_063,
  childCount: 16_139,
  placementCount: 51_994,
  currentChildren: 8_071,
  currentFosterHomePlacements: 4_343,
  currentKinPlacements: 3_688,
  currentNonfamilyPlacements: 40,
  uniqueProvidersWithFosterHomePlacements: 2_733,
  providersLicensedBeyondReportingDate: 3_391,
} as const;
