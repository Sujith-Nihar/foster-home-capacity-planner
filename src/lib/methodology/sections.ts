import {
  AGE_GROUPS,
  COUNTY_NORMALIZATION_MAP,
  LICENSE_EXPIRATION_WINDOWS,
  RECRUITMENT_MINIMUM_VOLUME,
  RECRUITMENT_PRIORITY_RULES,
  RETENTION_THRESHOLDS,
  SOURCE_DATA_FACTS,
} from "@/config/metrics";
import {
  COMPARABLE_COUNTIES,
  METHODOLOGY_LIMITATIONS,
  PROTOTYPE_PLANNING_RULES_INTRO,
  RECENT_WINDOW_LABEL,
  RECRUITMENT_METRICS,
  RECRUITMENT_PLANNING_CAVEAT,
  RETENTION_METRICS,
  RETENTION_OUTREACH_RULES,
  SOURCE_DATA_DEFINITIONS,
  TOP_25_PERCENT,
} from "@/content/methodology";
import { formatCount } from "@/lib/utils/formatters";

export type MethodologySection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const METHODOLOGY_CALLOUTS = [
  RECRUITMENT_METRICS.childrenPerEngagedProvider.limitation!,
  "Published provider age preferences reflect current license preferences and may differ from historical preferences used at the time of past placements.",
  RETENTION_METRICS.outreachPriority.limitation!,
  `Recruitment attention compares eligible counties for planning review. ${RECRUITMENT_PLANNING_CAVEAT}`,
  "Kin and nonfamily placement counts are shown for context. Nonfamily placements are not automatically assumed suitable for standard foster-home recruitment planning.",
] as const;

export function buildMethodologySections(): MethodologySection[] {
  const countyNormalizationEntries = Object.entries(COUNTY_NORMALIZATION_MAP).map(
    ([source, normalized]) => `${source} → ${normalized}`,
  );

  return [
    {
      id: "source-data-definitions",
      title: "1. Source-data definitions",
      paragraphs: [
        "These definitions come directly from the supplied provider, child, and placement files as of the reporting date.",
        `Validated source scale at build time: ${formatCount(SOURCE_DATA_FACTS.providerCount)} providers, ${formatCount(SOURCE_DATA_FACTS.childCount)} children, and ${formatCount(SOURCE_DATA_FACTS.placementCount)} placement records.`,
      ],
      bullets: [
        ...SOURCE_DATA_DEFINITIONS.map((item) => `${item.term}: ${item.definition}`),
        "Latest placement: the placement row with the highest placement_index for each child.",
        "Date intervals are end-exclusive throughout the pipeline.",
        `County normalization uses a fixed mapping only. ${countyNormalizationEntries.length > 0 ? countyNormalizationEntries.join("; ") : "No county label corrections are configured."}`,
        `Missing ages remain in total demand counts but are excluded from age-specific ratio calculations. Age bands: ${AGE_GROUPS.map((group) => group.label).join(", ")}.`,
        "Merged foster-home placement intervals summarize when a provider had activity without publishing child identifiers.",
      ],
    },
    {
      id: "calculated-metrics",
      title: "2. Metrics calculated by the application",
      paragraphs: [
        "The application calculates the following metrics from the source data. Formulas below describe the published logic.",
      ],
      bullets: [
        `${RECRUITMENT_METRICS.childrenPerEngagedProvider.label}: ${RECRUITMENT_METRICS.childrenPerEngagedProvider.explanation} Formula: ${RECRUITMENT_METRICS.childrenPerEngagedProvider.formula}.`,
        `${RECRUITMENT_METRICS.outOfCountyRate.label}: ${RECRUITMENT_METRICS.outOfCountyRate.explanation} Formula: ${RECRUITMENT_METRICS.outOfCountyRate.formula}.`,
        `${RECRUITMENT_METRICS.ageGroupPressure.label}: ${RECRUITMENT_METRICS.ageGroupPressure.explanation} Formula: ${RECRUITMENT_METRICS.ageGroupPressure.formula}.`,
        `${RETENTION_METRICS.activePlacementDays.label}: ${RETENTION_METRICS.activePlacementDays.explanation}`,
        `${RETENTION_METRICS.recentActiveDays.label}: ${RETENTION_METRICS.recentActiveDays.explanation}`,
        `${RETENTION_METRICS.eligibleLicensedDays.label}: ${RETENTION_METRICS.eligibleLicensedDays.explanation} Recent window: ${RECENT_WINDOW_LABEL}.`,
        `${RETENTION_METRICS.recentEngagement.label}: ${RETENTION_METRICS.recentEngagement.explanation} Formula: ${RETENTION_METRICS.recentEngagement.formula}.`,
        `${RETENTION_METRICS.daysSinceLastPlacement.label}: ${RETENTION_METRICS.daysSinceLastPlacement.explanation} Active providers are shown as currently active rather than 0 days.`,
        `Licenses ending within ${LICENSE_EXPIRATION_WINDOWS.days90} and ${LICENSE_EXPIRATION_WINDOWS.days180} days count currently licensed providers whose license end date falls inside each window.`,
      ],
    },
    {
      id: "prototype-planning-rules",
      title: "3. Planning rules selected for this prototype",
      paragraphs: [
        PROTOTYPE_PLANNING_RULES_INTRO,
        COMPARABLE_COUNTIES.explanation,
        COMPARABLE_COUNTIES.policyNote,
        TOP_25_PERCENT.fullDefinition,
      ],
      bullets: [
        `County eligibility thresholds: at least ${RECRUITMENT_MINIMUM_VOLUME.currentFosterHomeChildren} current foster-home children and ${RECRUITMENT_MINIMUM_VOLUME.activeProviders} engaged providers.`,
        `Median: the middle value among comparable counties for each indicator.`,
        `75th percentile: ${TOP_25_PERCENT.fullDefinition}`,
        `High suggested recruitment attention: ${RECRUITMENT_PRIORITY_RULES.highMinIndicatorsAt75th} indicators in the top 25% of comparable counties.`,
        `Medium suggested recruitment attention: ${RECRUITMENT_PRIORITY_RULES.mediumMinIndicatorsAt75th} indicator in the top 25%, or ${RECRUITMENT_PRIORITY_RULES.mediumMinIndicatorsAtMedian} indicators above the median.`,
        "Low suggested recruitment attention: eligible counties that do not meet High or Medium rules.",
        "Limited data comparison status: counties below minimum volume thresholds are not scored for suggested recruitment attention.",
        `High suggested outreach priority: ${RETENTION_OUTREACH_RULES.high.join("; ")}.`,
        `Medium suggested outreach priority: ${RETENTION_OUTREACH_RULES.medium.join("; ")}.`,
        `Low suggested outreach priority: ${RETENTION_OUTREACH_RULES.low[0]}.`,
        `Engagement-based outreach rules require at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days in the recent window.`,
        RECRUITMENT_PLANNING_CAVEAT,
        RETENTION_METRICS.outreachPriority.limitation!,
      ],
    },
    {
      id: "limitations",
      title: "4. Limitations and appropriate use",
      paragraphs: [
        "This build is a read-only decision-support snapshot for one reporting date. It does not replace case review, licensing workflow, or local knowledge.",
        "Metrics depend on source-file completeness, including a small number of missing child ages.",
      ],
      bullets: [...METHODOLOGY_LIMITATIONS, "Raw child and placement records are never published through the application."],
    },
  ];
}

export const REQUIRED_METHODOLOGY_PHRASES = METHODOLOGY_CALLOUTS;
