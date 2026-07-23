import {
  AGE_GROUPS,
  COUNTY_NORMALIZATION_MAP,
  LICENSE_EXPIRATION_WINDOWS,
  RECENT_WINDOW_START,
  RECRUITMENT_MINIMUM_VOLUME,
  RECRUITMENT_PRIORITY_PERCENTILES,
  RECRUITMENT_PRIORITY_RULES,
  REPORTING_DATE,
  RETENTION_THRESHOLDS,
  SOURCE_DATA_FACTS,
} from "@/config/metrics";
import { formatCount, formatPercent, formatReportingDate } from "@/lib/utils/formatters";

export type MethodologySection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const METHODOLOGY_CALLOUTS = [
  "Licensed and active provider counts describe the current provider base. They are not available beds, vacancies, or guaranteed placement capacity.",
  "Published provider age preferences reflect current license preferences and may differ from historical preferences used at the time of past placements.",
  "Outreach priority is rule-based decision support for staff review. It is not a prediction of closure, non-renewal, or future placement outcomes.",
  "Recruitment priority compares eligible counties for planning attention. It is not proof that a county is short of foster homes.",
  "Kin and nonfamily placement counts are shown for context. Nonfamily placements are not automatically assumed suitable for standard foster-home recruitment planning.",
] as const;

export function buildMethodologySections(): MethodologySection[] {
  const countyNormalizationEntries = Object.entries(COUNTY_NORMALIZATION_MAP).map(
    ([source, normalized]) => `${source} → ${normalized}`,
  );

  return [
    {
      id: "source-datasets",
      title: "Source datasets",
      paragraphs: [
        "This application is built from three local CSV extracts that are processed offline before any aggregated metrics are published:",
      ],
      bullets: [
        "Provider file: license dates, county, licensed and active day totals, and current age preferences.",
        "Child file: removal and discharge timing, age fields, and removal county.",
        "Placement file: placement intervals, resource type, counties, and provider links for foster-home placements.",
        `Validated source scale at build time: ${formatCount(SOURCE_DATA_FACTS.providerCount)} providers, ${formatCount(SOURCE_DATA_FACTS.childCount)} children, and ${formatCount(SOURCE_DATA_FACTS.placementCount)} placement records.`,
      ],
    },
    {
      id: "reporting-date",
      title: "Reporting date",
      paragraphs: [
        `All published metrics use a single reporting date of ${formatReportingDate(REPORTING_DATE)}.`,
        "Current-child logic, license status, placement status, county rankings, and provider outreach classifications are evaluated as of that cutoff.",
      ],
    },
    {
      id: "current-child",
      title: "Current-child definition",
      paragraphs: [
        "A child is current when discharge_date is null in the child file.",
        "Current-child counts in this application describe children in care at the reporting date, not lifetime caseload volume.",
      ],
    },
    {
      id: "latest-placement",
      title: "Latest-placement definition",
      paragraphs: [
        "Each child's latest placement is the row with the highest placement_index for that child.",
        "Latest-placement type drives whether a child is counted in foster-home demand, kin context, or nonfamily context.",
      ],
    },
    {
      id: "current-placement",
      title: "Current-placement definition",
      paragraphs: [
        `A placement is active at the reporting date when its latest interval ends on ${formatReportingDate(REPORTING_DATE)}.`,
        "Date intervals throughout the pipeline are end-exclusive: the end date itself is not counted inside the interval.",
        "For retention metrics, currently_has_placement is true when the provider has an active foster-home placement interval at the cutoff.",
      ],
    },
    {
      id: "current-license",
      title: "Current-license definition",
      paragraphs: [
        `A provider is currently licensed when license_start_date is on or before ${formatReportingDate(REPORTING_DATE)} and license_end_date is after ${formatReportingDate(REPORTING_DATE)}.`,
        "Only currently licensed providers appear in retention tables and provider detail pages.",
      ],
    },
    {
      id: "county-normalization",
      title: "County normalization",
      paragraphs: [
        "County names are normalized before joins and display using a fixed, documented mapping. Fuzzy matching is not used.",
      ],
      bullets:
        countyNormalizationEntries.length > 0
          ? countyNormalizationEntries
          : ["No county label corrections are configured."],
    },
    {
      id: "missing-age",
      title: "Missing-age handling",
      paragraphs: [
        "Children are grouped into 0–5, 6–12, 13–17, and Unknown age bands.",
        "Children with missing age remain in total demand counts but are excluded from age-specific ratio calculations.",
        `The Unknown band is listed separately from defined age bands (${AGE_GROUPS.map((group) => group.label).join(", ")}).`,
      ],
    },
    {
      id: "interval-merging",
      title: "Interval merging",
      paragraphs: [
        "Foster-home placement intervals for each provider are merged when they overlap or touch on adjacent dates.",
        "Merged activity periods are published without child identifiers. They summarize when a provider had placement activity, not which children were served.",
      ],
    },
    {
      id: "active-days",
      title: "Active days",
      paragraphs: [
        "An active day is a calendar day that falls inside a merged foster-home placement interval for a provider.",
        "total_active_days counts active days across the provider's full history in the source data.",
      ],
    },
    {
      id: "recent-window",
      title: "Recent-window clipping",
      paragraphs: [
        `Recent engagement metrics use a one-year window from ${formatReportingDate(RECENT_WINDOW_START)} through ${formatReportingDate(REPORTING_DATE)}.`,
        "Both active placement days and eligible licensed days are clipped to this window before engagement is calculated.",
      ],
    },
    {
      id: "eligible-licensed-days",
      title: "Eligible licensed days",
      paragraphs: [
        "Eligible licensed days count the days a provider held a current license during the recent window.",
        "These days form the denominator for engagement rate so inactive license periods do not inflate the metric.",
      ],
    },
    {
      id: "engagement-rate",
      title: "Engagement rate",
      paragraphs: [
        "Engagement rate equals active_days_last_365 divided by eligible_licensed_days_last_365.",
        "When a provider has no eligible licensed days in the recent window, engagement is not calculated.",
      ],
    },
    {
      id: "provider-preferences",
      title: "Current provider preferences",
      paragraphs: [
        "Published min_age and max_age values describe the provider's current licensed age preferences.",
        "Age-group pressure matching treats a provider as matching a band when min_age is less than or equal to the group maximum and max_age is greater than or equal to the group minimum.",
      ],
    },
    {
      id: "recruitment-priority",
      title: "Recruitment indicators and priority",
      paragraphs: [
        "Main foster-home demand is grouped by normalized removal county. Kin and nonfamily counts are shown separately.",
        "Eligible counties are compared on children_per_active_provider, out_of_county_foster_rate, and the highest non-null children_per_matching_active_provider age-group pressure value.",
        `Statewide medians and ${RECRUITMENT_PRIORITY_PERCENTILES.high}th percentiles are calculated among eligible counties only.`,
      ],
      bullets: [
        `High planning priority: at least ${RECRUITMENT_PRIORITY_RULES.highMinIndicatorsAt75th} indicators at or above the ${RECRUITMENT_PRIORITY_PERCENTILES.high}th percentile.`,
        `Medium planning priority: at least ${RECRUITMENT_PRIORITY_RULES.mediumMinIndicatorsAt75th} indicator at or above the ${RECRUITMENT_PRIORITY_PERCENTILES.high}th percentile, or at least ${RECRUITMENT_PRIORITY_RULES.mediumMinIndicatorsAtMedian} indicators at or above the median.`,
        "Low planning priority: eligible counties that do not meet the High or Medium rules.",
        "Limited data: counties below minimum volume rules are shown separately and excluded from comparative ranking charts.",
        `License expiration exposure is reported for licenses ending within ${LICENSE_EXPIRATION_WINDOWS.days90} and ${LICENSE_EXPIRATION_WINDOWS.days180} days.`,
      ],
    },
    {
      id: "retention-priority",
      title: "Retention indicators and priority",
      paragraphs: [
        "Retention views classify currently licensed providers into High, Medium, or Low outreach priority using transparent rules. High rules are evaluated before Medium rules.",
      ],
      bullets: [
        `High outreach priority: inactive for at least ${RETENTION_THRESHOLDS.highInactivityDays} days; inactive with license expiring within ${RETENTION_THRESHOLDS.highExpirationDays} days and inactive for at least ${RETENTION_THRESHOLDS.highInactivityWithExpirationDays} days; or engagement below ${formatPercent(RETENTION_THRESHOLDS.highEngagementRateMax, 0)} with at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days.`,
        `Medium outreach priority: inactive for at least ${RETENTION_THRESHOLDS.mediumInactivityDays} days; inactive with license expiring within ${RETENTION_THRESHOLDS.mediumExpirationDays} days; engagement below ${formatPercent(RETENTION_THRESHOLDS.mediumEngagementRateMax, 0)} with at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days; or active with license expiring within ${RETENTION_THRESHOLDS.mediumActiveExpirationDays} days.`,
        "Low outreach priority: all other currently licensed providers.",
        "Every triggered rule is stored and shown as a readable reason tag.",
      ],
    },
    {
      id: "minimum-volume",
      title: "Minimum county-volume rules",
      paragraphs: [
        `A county must have at least ${RECRUITMENT_MINIMUM_VOLUME.currentFosterHomeChildren} current foster-home children and at least ${RECRUITMENT_MINIMUM_VOLUME.activeProviders} active local providers before it is eligible for comparative recruitment priority.`,
        "Counties below these thresholds remain visible but are labeled Limited data.",
      ],
    },
    {
      id: "privacy",
      title: "Privacy choices",
      paragraphs: [
        "Raw child and placement records are never uploaded to Supabase or exposed through the public application.",
        "Published outputs exclude child identifiers, child-level removal and discharge dates, and child-level placement histories.",
        "Provider activity periods are merged aggregates only.",
        "The site is marked noindex, nofollow for search engines.",
      ],
    },
    {
      id: "limitations",
      title: "Limitations",
      paragraphs: [
        "This build is a read-only decision-support snapshot for one reporting date. It does not replace case review, licensing workflow, or local knowledge.",
        "Metrics depend on source-file completeness, including a small number of missing child ages.",
        "The application does not model available beds, vacancy, household composition, or placement approval constraints.",
        "No predictive machine learning, risk scores, or closure probabilities are used.",
      ],
    },
  ];
}

export const REQUIRED_METHODOLOGY_PHRASES = METHODOLOGY_CALLOUTS;
