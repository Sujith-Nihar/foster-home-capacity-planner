import {
  AGE_GROUPS,
  COUNTY_NORMALIZATION_MAP,
  LICENSE_EXPIRATION_WINDOWS,
  RECRUITMENT_MINIMUM_VOLUME,
  RECRUITMENT_PRIORITY_RULES,
  REPORTING_DATE,
  RETENTION_THRESHOLDS,
  SOURCE_DATA_FACTS,
} from "@/config/metrics";
import {
  COMPARABLE_COUNTIES,
  METHODOLOGY_LIMITATIONS,
  RECENT_WINDOW_LABEL,
  RECRUITMENT_METRICS,
  RECRUITMENT_PLANNING_CAVEAT,
  RETENTION_METRICS,
  RETENTION_OUTREACH_CAVEAT,
  TOP_25_PERCENT,
} from "@/content/methodology";
import { formatCount, formatPercent, formatReportingDate } from "@/lib/utils/formatters";

export const METHODOLOGY_SECTION_IDS = {
  definitions: "methodology-definitions",
  recruitmentMetrics: "methodology-recruitment-metrics",
  retentionMetrics: "methodology-retention-metrics",
  recruitmentRules: "methodology-recruitment-rules",
  retentionRules: "methodology-retention-rules",
  limitations: "methodology-limitations",
  technicalDetails: "methodology-technical-details",
} as const;

export const METHODOLOGY_SCROLL_MARGIN_CLASS = "scroll-mt-32";

export const METHODOLOGY_NAV_ITEMS = [
  { id: METHODOLOGY_SECTION_IDS.definitions, label: "Definitions" },
  { id: METHODOLOGY_SECTION_IDS.recruitmentMetrics, label: "Recruitment metrics" },
  { id: METHODOLOGY_SECTION_IDS.retentionMetrics, label: "Retention metrics" },
  { id: METHODOLOGY_SECTION_IDS.recruitmentRules, label: "Recruitment rules" },
  { id: METHODOLOGY_SECTION_IDS.retentionRules, label: "Retention rules" },
  { id: METHODOLOGY_SECTION_IDS.limitations, label: "Limitations" },
  { id: METHODOLOGY_SECTION_IDS.technicalDetails, label: "Technical details" },
] as const;

export const IMPORTANT_THINGS_TO_KNOW = [
  "This application does not measure available beds, vacancies or open placements.",
  "Recruitment attention and outreach priority are transparent staff-review categories, not official DCFS classifications or predictions.",
  "Current provider age preferences may differ from preferences used during historical placements.",
  "Published pages do not expose child identifiers or child-level placement records.",
] as const;

export function buildMethodologyIntroDescription(): string {
  return `Plain-language definitions, calculations, planning rules and limitations for the ${formatReportingDate(REPORTING_DATE)} reporting snapshot.`;
}

export type MethodologyDefinition = {
  term: string;
  definition: string;
  technicalDetail?: string;
};

export type MethodologyDefinitionGroup = {
  title: string;
  definitions: MethodologyDefinition[];
};

export const METHODOLOGY_CORE_DEFINITIONS: MethodologyDefinitionGroup[] = [
  {
    title: "Children",
    definitions: [
      {
        term: "Current child",
        definition:
          "A child who appears in the source child file without a discharge date as of the reporting date.",
      },
      {
        term: "Foster-home child",
        definition:
          "A current child with at least one foster-home placement active on the reporting date.",
      },
      {
        term: "Age group",
        definition: `Children grouped into ${AGE_GROUPS.filter((group) => group.label !== "Unknown").map((group) => group.label).join(", ")} for demand and recruitment comparisons.`,
        technicalDetail:
          "Children with missing ages remain in total demand counts but are excluded from age-specific ratio calculations.",
      },
      {
        term: "Home county",
        definition:
          "The county associated with the child in the source child file, used as the county of record for recruitment comparisons.",
      },
    ],
  },
  {
    title: "Placements",
    definitions: [
      {
        term: "Current placement",
        definition:
          "A placement interval that is active on the reporting date under end-exclusive date rules.",
      },
      {
        term: "Foster-home placement",
        definition:
          "A placement recorded in the foster-home category used for recruitment and retention planning metrics.",
      },
      {
        term: "Out-of-county placement",
        definition:
          "A current foster-home placement for a child from one county that is located in a different county.",
      },
      {
        term: "Day with an active placement",
        definition:
          "A calendar day when the provider had at least one active foster-home placement. Overlapping placements count only once per day.",
        technicalDetail:
          "Internally recorded as an active placement day within a merged foster-home placement interval.",
      },
    ],
  },
  {
    title: "Providers",
    definitions: [
      {
        term: "Currently licensed provider",
        definition:
          "A provider whose license start is on or before the reporting date and whose license end is after it.",
      },
      {
        term: "Engaged provider",
        definition:
          "A currently licensed provider with at least one foster-home placement active on the reporting date.",
      },
      {
        term: "Current placement status",
        definition:
          "Whether the provider has at least one foster-home placement active on the reporting date.",
      },
      {
        term: "Preferred age range",
        definition:
          "The licensed minimum and maximum child ages published for the provider at the reporting date.",
        technicalDetail:
          "Current license preferences may differ from preferences used during historical placements.",
      },
    ],
  },
];

export type MethodologyMetricCard = {
  title: string;
  whatItMeans: string;
  whyUseful: string;
  howCalculated: string;
  limitation: string;
  technicalFormula?: string;
};

export const METHODOLOGY_RECRUITMENT_METRICS: MethodologyMetricCard[] = [
  {
    title: RECRUITMENT_METRICS.childrenPerEngagedProvider.label,
    whatItMeans:
      "The number of current foster-home children from a county relative to its engaged local provider base.",
    whyUseful:
      "Higher values may indicate greater recruitment pressure relative to the current provider base.",
    howCalculated: "Current foster-home children ÷ engaged local providers",
    limitation:
      "This does not measure available beds or prove that a county has a foster-home shortage.",
    technicalFormula: RECRUITMENT_METRICS.childrenPerEngagedProvider.formula,
  },
  {
    title: RECRUITMENT_METRICS.outOfCountyRate.label,
    whatItMeans:
      "The share of current foster-home children from a county who are placed in another county.",
    whyUseful:
      "A higher share may indicate that more children are being served outside the home county.",
    howCalculated:
      "Current foster-home children placed in another county ÷ current foster-home children from the county",
    limitation:
      "An out-of-county placement does not by itself prove that local capacity was unavailable.",
    technicalFormula: RECRUITMENT_METRICS.outOfCountyRate.formula,
  },
  {
    title: RECRUITMENT_METRICS.ageGroupPressure.label,
    whatItMeans:
      "The number of foster-home children in an age group relative to engaged providers whose preferences include that age group.",
    whyUseful:
      "Higher values identify age groups with more children relative to the matching engaged provider base.",
    howCalculated:
      "Foster-home children in the age group ÷ engaged providers whose preferences include that age group",
    limitation:
      "A matching preference does not mean that a provider has an available placement.",
    technicalFormula: RECRUITMENT_METRICS.ageGroupPressure.formula,
  },
];

export const METHODOLOGY_RECRUITMENT_METRICS_NOTE =
  "Higher values indicate more children relative to the matching engaged provider base. They do not guarantee that a specific provider has an available placement.";

export const METHODOLOGY_RETENTION_METRICS: MethodologyMetricCard[] = [
  {
    title: "Current placement status",
    whatItMeans:
      "Whether the provider has at least one foster-home placement active on the reporting date.",
    whyUseful: "Shows whether the provider is currently serving a foster-home placement.",
    howCalculated: "Active foster-home placement on the reporting date",
    limitation: "This does not measure provider availability for a new placement.",
  },
  {
    title: "Days with an active placement",
    whatItMeans:
      "The number of calendar days when the provider had at least one active foster-home placement. Overlapping placements count only once per day.",
    whyUseful: "Summarizes how often the provider had recorded placement activity.",
    howCalculated: "Count of calendar days inside merged foster-home placement intervals",
    limitation: "This counts recorded activity, not placement offers accepted or declined.",
    technicalFormula: "active placement days from merged intervals",
  },
  {
    title: "Placement activity during the past 12 months",
    whatItMeans:
      "Days with an active placement during the recent period ÷ eligible licensed days during that period.",
    whyUseful:
      "Shows how consistently the provider had placement activity during the recent licensed period.",
    howCalculated:
      "Days with an active placement during the past 12 months ÷ eligible licensed days during the past 12 months",
    limitation:
      "This describes recorded placement activity, not provider quality, availability or the number of placement offers accepted or declined.",
    technicalFormula: RETENTION_METRICS.recentEngagement.formula,
  },
  {
    title: "Eligible licensed days",
    whatItMeans:
      "Days during the past 12 months when the provider held an active license and could be included in the calculation.",
    whyUseful:
      "Provides the denominator for recent placement-activity comparisons across providers with different license periods.",
    howCalculated: `Licensed days between ${RECENT_WINDOW_LABEL}`,
    limitation: "Very short license periods can make percentages less stable.",
  },
  {
    title: "Days since last placement",
    whatItMeans:
      "Days since the provider's most recent completed foster-home placement ended. Providers with a current placement are displayed as having a current placement rather than zero days.",
    whyUseful: "Helps staff review providers who have been inactive for an extended period.",
    howCalculated: "Reporting date minus the end date of the most recent completed placement",
    limitation: "A gap in placement activity does not by itself indicate provider availability.",
  },
  {
    title: "License exposure",
    whatItMeans:
      "Currently licensed providers whose license end date falls within the selected future window.",
    whyUseful:
      "Highlights providers whose licenses may need renewal review within the next 90 or 180 days.",
    howCalculated: `License end date within ${LICENSE_EXPIRATION_WINDOWS.days90} or ${LICENSE_EXPIRATION_WINDOWS.days180} days of the reporting date`,
    limitation: "This is a timing signal, not a prediction of non-renewal.",
  },
];

export const METHODOLOGY_RETENTION_METRICS_NOTE =
  "This describes recorded placement activity, not provider quality, availability or the number of placement offers accepted or declined.";

export const METHODOLOGY_RECRUITMENT_RULES_INTRO =
  "These transparent prototype rules organize county review. They are not official DCFS classifications and do not prove that a county lacks foster homes.";

export const METHODOLOGY_RECRUITMENT_COMPARISON_REQUIREMENTS = {
  title: "Eligible for comparison",
  bullets: [
    `At least ${RECRUITMENT_MINIMUM_VOLUME.currentFosterHomeChildren} current foster-home children`,
    `At least ${RECRUITMENT_MINIMUM_VOLUME.activeProviders} engaged providers`,
  ],
  explanation: "These minimums reduce unstable comparisons based on very small counts.",
  policyNote: COMPARABLE_COUNTIES.policyNote,
} as const;

export const METHODOLOGY_RECRUITMENT_INDICATORS = [
  RECRUITMENT_METRICS.childrenPerEngagedProvider.label,
  RECRUITMENT_METRICS.outOfCountyRate.label,
  RECRUITMENT_METRICS.ageGroupPressure.label,
] as const;

export const METHODOLOGY_RECRUITMENT_LEVELS = [
  {
    level: "High",
    rule: `At least ${RECRUITMENT_PRIORITY_RULES.highMinIndicatorsAt75th} of the three indicators are in the highest quarter of comparable counties.`,
  },
  {
    level: "Medium",
    rule: `One indicator is in the highest quarter, or at least ${RECRUITMENT_PRIORITY_RULES.mediumMinIndicatorsAtMedian} indicators are above the typical comparable county.`,
  },
  {
    level: "Low",
    rule: "The county is eligible but does not meet the High or Medium rules.",
  },
  {
    level: "Limited data",
    rule: "The county does not meet the minimum child or engaged-provider counts and is not assigned a recruitment-attention level.",
  },
] as const;

export const METHODOLOGY_HIGHEST_QUARTER_CALLOUT =
  "Highest quarter means the value is at or above approximately 75% of counties in the comparison group.";

export const METHODOLOGY_MEDIAN_TECHNICAL_NOTE =
  "Typical comparable county refers to the median value among eligible counties in the comparison group.";

export const METHODOLOGY_RETENTION_RULES_INTRO =
  "These rules identify licensed providers who may warrant staff review. They do not predict provider closure, license non-renewal or provider performance.";

export function buildStaffFacingRetentionOutreachRules() {
  return {
    high: [
      `No current placement for at least ${RETENTION_THRESHOLDS.highInactivityDays} days`,
      `No current placement for at least ${RETENTION_THRESHOLDS.highInactivityWithExpirationDays} days and license ending within ${RETENTION_THRESHOLDS.highExpirationDays} days`,
      `Placement activity below ${formatPercent(RETENTION_THRESHOLDS.highEngagementRateMax, 0)} after at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days`,
    ],
    medium: [
      `No current placement for at least ${RETENTION_THRESHOLDS.mediumInactivityDays} days`,
      `No current placement and license ending within ${RETENTION_THRESHOLDS.mediumExpirationDays} days`,
      `Placement activity below ${formatPercent(RETENTION_THRESHOLDS.mediumEngagementRateMax, 0)} after at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days`,
      `Has a current placement and license ending within ${RETENTION_THRESHOLDS.mediumActiveExpirationDays} days`,
    ],
    low: ["No High or Medium outreach rule applies."],
  } as const;
}

export const METHODOLOGY_RETENTION_MEDIUM_NOTE = "Medium applies only when no High rule applies.";

export const METHODOLOGY_RETENTION_ACTIVITY_NOTE = `Placement-activity rules require at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days so that very short license periods do not produce unstable percentages.`;

export const METHODOLOGY_LIMITATIONS_INTRO =
  "This is a read-only decision-support snapshot. It does not replace case review, licensing workflow, provider contact or local program knowledge.";

export const METHODOLOGY_LIMITATION_GROUPS = [
  {
    title: "Capacity information not available",
    bullets: [
      "No available-bed or vacancy data",
      "No placement-offer or refusal data",
      "Provider counts do not equal open capacity",
    ],
  },
  {
    title: "Interpretation limits",
    bullets: [
      "Out-of-county placements can occur for many reasons",
      "Placement activity is not provider quality",
      "Suggested categories are staff-review aids, not predictions",
      "Current preferences may differ from historical preferences",
    ],
  },
  {
    title: "Data limits",
    bullets: [
      "Some child ages may be missing",
      "Limited-data counties are not scored",
      `The snapshot is fixed to the reporting date (${formatReportingDate(REPORTING_DATE)})`,
    ],
  },
  {
    title: "Privacy",
    bullets: [
      "Child identifiers and child-level placement records are not published",
      "Only aggregated child metrics and provider-level planning information are shown",
    ],
  },
] as const;

export function buildTechnicalDetailsContent() {
  const countyNormalizationEntries = Object.entries(COUNTY_NORMALIZATION_MAP).map(
    ([source, normalized]) => `${source} → ${normalized}`,
  );

  return {
    buildMetadata: [
      {
        label: "Reporting date",
        description:
          "The date used to determine which children, placements and providers are considered current.",
      },
      {
        label: "Generated at",
        description:
          "When the processed application snapshot was built. This is separate from the reporting date used for current-record logic.",
      },
      {
        label: "ETL version",
        description: "Version identifier for the data-processing pipeline that produced the snapshot.",
      },
      {
        label: "Source hash",
        description: "Checksum of the validated source files used to build the snapshot.",
      },
    ],
    dateIntervalRules: [
      "Date intervals are end-exclusive throughout the pipeline.",
      `Recent activity window: ${RECENT_WINDOW_LABEL}.`,
      `All current-record logic uses ${formatReportingDate(REPORTING_DATE)} as the cutoff.`,
    ],
    normalizationRules: [
      countyNormalizationEntries.length > 0
        ? `County normalization uses a fixed mapping only: ${countyNormalizationEntries.join("; ")}.`
        : "No county label corrections are configured.",
      `Missing ages remain in total demand counts but are excluded from age-specific ratio calculations. Age bands: ${AGE_GROUPS.map((group) => group.label).join(", ")}.`,
    ],
    privacyAggregation: [
      "Merged foster-home placement intervals summarize when a provider had activity without publishing child identifiers.",
      "Raw child and placement records are never published through the application.",
    ],
    rawFormulas: [
      `${RECRUITMENT_METRICS.childrenPerEngagedProvider.label}: ${RECRUITMENT_METRICS.childrenPerEngagedProvider.formula}`,
      `${RECRUITMENT_METRICS.outOfCountyRate.label}: ${RECRUITMENT_METRICS.outOfCountyRate.formula}`,
      `${RECRUITMENT_METRICS.ageGroupPressure.label}: ${RECRUITMENT_METRICS.ageGroupPressure.formula}`,
      `${RETENTION_METRICS.recentEngagement.label}: ${RETENTION_METRICS.recentEngagement.formula}`,
    ],
    implementationNotes: [
      "Latest placement: the placement row with the highest placement_index for each child.",
      `Validated source scale at build time: ${formatCount(SOURCE_DATA_FACTS.providerCount)} providers, ${formatCount(SOURCE_DATA_FACTS.childCount)} children, and ${formatCount(SOURCE_DATA_FACTS.placementCount)} placement records.`,
      "Kin and nonfamily placement counts are shown for context. Nonfamily placements are not automatically assumed suitable for standard foster-home recruitment planning.",
    ],
    retainedLimitations: METHODOLOGY_LIMITATIONS.filter(
      (item) =>
        !item.includes("available-bed") &&
        !item.includes("placement-refusal") &&
        !item.includes("Current licensed age preferences") &&
        !item.includes("Out-of-county placements") &&
        !item.includes("Recent placement activity describes engagement") &&
        !item.includes("Priorities support staff review") &&
        !item.includes("Small counties below minimum") &&
        !item.includes("reporting snapshot is fixed"),
    ),
    planningPolicyNotes: [
      COMPARABLE_COUNTIES.policyNote,
      RECRUITMENT_PLANNING_CAVEAT,
      RETENTION_OUTREACH_CAVEAT,
      TOP_25_PERCENT.fullDefinition,
      METHODOLOGY_MEDIAN_TECHNICAL_NOTE,
    ],
  };
}
