import {
  LICENSE_EXPIRATION_WINDOWS,
  RECENT_WINDOW_START,
  RECRUITMENT_MINIMUM_VOLUME,
  RECRUITMENT_PRIORITY_RULES,
  REPORTING_DATE,
  RETENTION_THRESHOLDS,
} from "@/config/metrics";
import { formatPercent, formatReportingDate } from "@/lib/utils/formatters";

export type MetricDefinition = {
  id: string;
  label: string;
  explanation: string;
  interpretation?: string;
  limitation?: string;
  formula?: string;
};

export const COMPARABLE_COUNTIES = {
  shortLabel: "Comparable counties",
  explanation:
    "County comparisons include counties with at least 10 current foster-home children and 3 engaged providers. These minimums reduce unstable comparisons based on very small counts.",
  policyNote:
    "These minimums were selected for this assessment and were not provided as an official DCFS policy.",
  comparisonGroupLabel: `Counties with at least ${RECRUITMENT_MINIMUM_VOLUME.currentFosterHomeChildren} current foster-home children and ${RECRUITMENT_MINIMUM_VOLUME.activeProviders} engaged providers`,
} as const;

export const TOP_25_PERCENT = {
  shortLabel: "Top 25%",
  tooltip:
    "Top 25% among comparable counties with at least 10 foster-home children and 3 engaged providers.",
  fullDefinition:
    "The 75th percentile marks the top quarter of comparable counties. A value at or above it is higher than approximately three out of every four counties in the comparison group.",
} as const;

export const PROTOTYPE_PLANNING_RULES_INTRO =
  "The following thresholds were selected for this assessment to provide a transparent and explainable prioritization workflow. They were not supplied by DCFS and should be reviewed with program staff before operational use.";

export const OVERVIEW_PRIORITY_CALLOUT = {
  title: "How priorities are created",
  text: "Recruitment and outreach categories are transparent prototype rules that organize staff review. They are not official DCFS classifications or predictions.",
  actionLabel: "View methodology",
} as const;

export const RECRUITMENT_PLANNING_CAVEAT =
  "Suggested recruitment attention is a transparent prototype planning rule. It is not an official DCFS classification and does not prove that a county has a foster-home shortage.";

export const RECRUITMENT_INDICATORS_CAVEAT =
  "These indicators support recruitment planning. They do not measure available beds or prove a foster-home shortage.";

export const RETENTION_OUTREACH_CAVEAT =
  "This category supports staff review. It does not predict provider closure, license non-renewal, or provider performance.";

export const PROVIDER_OUTREACH_CAVEAT =
  "This supports staff review and does not predict whether the provider will renew.";

export const RECRUITMENT_METRICS = {
  childrenPerEngagedProvider: {
    id: "children-per-engaged-provider",
    label: "Children per engaged provider",
    explanation:
      "Current foster-home children from the county divided by currently licensed local providers who have a current foster-home placement.",
    interpretation:
      "A higher value suggests greater demand relative to the currently engaged local provider base.",
    limitation: "This is not a count of available beds or open placements.",
    formula: "current_foster_home_children ÷ engaged local providers",
  },
  outOfCountyRate: {
    id: "out-of-county-rate",
    label: "Placed outside home county",
    explanation:
      "The share of current foster-home placements for children from this county that are located in another county.",
    interpretation: "A higher share may warrant review of local recruitment needs.",
    limitation:
      "An out-of-county placement does not by itself prove that local capacity was unavailable.",
    formula: "out-of-county foster-home children ÷ current foster-home children",
  },
  ageGroupPressure: {
    id: "age-group-pressure",
    label: "Age-group recruitment pressure",
    explanation:
      "Children in an age group divided by engaged providers whose current age preferences overlap that group.",
    interpretation:
      "A higher value identifies age groups with more children relative to the matching engaged provider base.",
    limitation:
      "A matching preference does not mean that a provider has an available bed or is currently accepting a placement.",
    formula: "foster-home children in age group ÷ matching engaged providers",
  },
  recruitmentAttention: {
    id: "recruitment-attention",
    label: "Suggested recruitment attention",
    explanation:
      "A transparent planning category based on children per engaged provider, out-of-county placement rate and the highest age-group pressure.",
    limitation: RECRUITMENT_PLANNING_CAVEAT,
  },
} as const satisfies Record<string, MetricDefinition>;

export const RETENTION_METRICS = {
  activePlacementDays: {
    id: "active-placement-days",
    label: "Active placement days",
    explanation:
      "Number of days on which the provider had at least one active foster-home placement. Overlapping placements count only once for each day.",
  },
  recentActiveDays: {
    id: "recent-active-days",
    label: "Recent active days",
    explanation: `Active placement days during the one-year period ending ${formatReportingDate(REPORTING_DATE)}.`,
  },
  eligibleLicensedDays: {
    id: "eligible-licensed-days",
    label: "Eligible licensed days",
    explanation:
      "Days during the previous year when the provider held an active license and was eligible to be included in the engagement calculation.",
  },
  recentEngagement: {
    id: "recent-engagement",
    label: "Recent placement activity",
    explanation: "Recent active days divided by eligible licensed days during the previous year.",
    interpretation: "This describes recent placement activity.",
    limitation:
      "It is not a provider-quality rating and does not show how many placement requests were offered or declined.",
    formula: "active_days_last_365 ÷ eligible_licensed_days_last_365",
  },
  daysSinceLastPlacement: {
    id: "days-since-last-placement",
    label: "Days since last placement",
    explanation:
      "Days since the provider's most recently completed foster-home placement ended.",
  },
  outreachPriority: {
    id: "outreach-priority",
    label: "Suggested outreach priority",
    explanation:
      "A rule-based staff-review category using inactivity, recent placement engagement and license timing.",
    limitation: RETENTION_OUTREACH_CAVEAT,
  },
} as const satisfies Record<string, MetricDefinition>;

export const RECRUITMENT_ATTENTION_CLASSIFICATIONS = [
  {
    level: "High",
    description: "At least two indicators are in the top 25% of comparable counties.",
  },
  {
    level: "Medium",
    description:
      "One indicator is in the top 25%, or at least two indicators are above the median among comparable counties.",
  },
  {
    level: "Low",
    description: "The county does not meet the High or Medium rules.",
  },
] as const;

export const COMPARISON_STATUS_DEFINITIONS = [
  {
    status: "Eligible",
    description: "Meets minimum volume for stable county comparison.",
  },
  {
    status: "Limited data",
    description: `Fewer than ${RECRUITMENT_MINIMUM_VOLUME.currentFosterHomeChildren} current foster-home children or fewer than ${RECRUITMENT_MINIMUM_VOLUME.activeProviders} engaged providers.`,
  },
] as const;

export const RETENTION_OUTREACH_RULES = {
  high: [
    `Inactive for at least ${RETENTION_THRESHOLDS.highInactivityDays} days`,
    `Inactive for at least ${RETENTION_THRESHOLDS.highInactivityWithExpirationDays} days and license ends within ${RETENTION_THRESHOLDS.highExpirationDays} days`,
    `Recent placement activity below ${formatPercent(RETENTION_THRESHOLDS.highEngagementRateMax, 0)} after at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days`,
  ],
  medium: [
    `Inactive for at least ${RETENTION_THRESHOLDS.mediumInactivityDays} days`,
    `Inactive and license ends within ${RETENTION_THRESHOLDS.mediumExpirationDays} days`,
    `Recent placement activity below ${formatPercent(RETENTION_THRESHOLDS.mediumEngagementRateMax, 0)} after at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days`,
    `Currently active and license ends within ${RETENTION_THRESHOLDS.mediumActiveExpirationDays} days`,
  ],
  low: ["No High or Medium condition applies"],
} as const;

export const METHODOLOGY_LIMITATIONS = [
  "No available-bed or vacancy data is included.",
  "No placement-refusal or offer data is included.",
  "Current licensed age preferences may differ from preferences used at the time of past placements.",
  "Out-of-county placements can occur for several reasons and do not by themselves prove a local shortage.",
  "Recent placement activity describes engagement, not provider quality.",
  "Priorities support staff review and are not predictions of closure, non-renewal, or placement outcomes.",
  "Small counties below minimum volume thresholds receive a Limited data comparison status and are not scored for suggested recruitment attention.",
  `The reporting snapshot is fixed at ${formatReportingDate(REPORTING_DATE)}.`,
] as const;

export const SOURCE_DATA_DEFINITIONS = [
  {
    term: "Reporting date",
    definition: `All current-record logic uses ${formatReportingDate(REPORTING_DATE)} as the cutoff.`,
  },
  {
    term: "Current child",
    definition: "A child with no discharge date in the source child file at the reporting date.",
  },
  {
    term: "Current placement",
    definition:
      "A foster-home placement interval that is active at the reporting date under end-exclusive date rules.",
  },
  {
    term: "Currently licensed provider",
    definition: "A provider whose license start is on or before the reporting date and license end is after it.",
  },
  {
    term: "Engaged provider",
    definition:
      "A currently licensed local provider with at least one active foster-home placement at the reporting date.",
  },
  {
    term: "Current age preference",
    definition: "The licensed minimum and maximum child ages published for the provider at the reporting date.",
  },
  {
    term: "Active placement day",
    definition:
      "A calendar day that falls inside a merged foster-home placement interval for a provider.",
  },
] as const;

export const RECRUITMENT_ATTENTION_HELP = {
  title: "How recruitment attention is calculated",
  indicators: [
    RECRUITMENT_METRICS.childrenPerEngagedProvider.label,
    RECRUITMENT_METRICS.outOfCountyRate.label,
    RECRUITMENT_METRICS.ageGroupPressure.label,
  ],
  comparisonGroup: COMPARABLE_COUNTIES.explanation,
  rulesIntro: PROTOTYPE_PLANNING_RULES_INTRO,
  highRule: RECRUITMENT_ATTENTION_CLASSIFICATIONS[0].description,
  mediumRule: RECRUITMENT_ATTENTION_CLASSIFICATIONS[1].description,
  caveat: RECRUITMENT_PLANNING_CAVEAT,
} as const;

export const RETENTION_OUTREACH_HELP = {
  title: "How outreach priority is calculated",
  explanation: RETENTION_METRICS.outreachPriority.explanation,
  rulesIntro: PROTOTYPE_PLANNING_RULES_INTRO,
  caveat: RETENTION_OUTREACH_CAVEAT,
} as const;

export const RECRUITMENT_PRIORITY_RULE_SUMMARY = {
  highMinTopQuarter: RECRUITMENT_PRIORITY_RULES.highMinIndicatorsAt75th,
  mediumMinTopQuarter: RECRUITMENT_PRIORITY_RULES.mediumMinIndicatorsAt75th,
  mediumMinAboveMedian: RECRUITMENT_PRIORITY_RULES.mediumMinIndicatorsAtMedian,
  licenseWindowDays: LICENSE_EXPIRATION_WINDOWS.days90,
} as const;

export const RECENT_WINDOW_LABEL = `${formatReportingDate(RECENT_WINDOW_START)} through ${formatReportingDate(REPORTING_DATE)}`;
