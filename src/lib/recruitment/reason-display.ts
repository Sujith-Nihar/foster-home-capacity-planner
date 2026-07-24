import { COMPARABLE_COUNTIES, TOP_25_PERCENT } from "@/content/methodology";

export type ExplainedReason = {
  primary: string;
  secondary?: string;
  technical?: string;
};

const RECRUITMENT_REASON_PATTERNS: Array<{
  match: RegExp;
  toExplained: (reason: string) => ExplainedReason;
}> = [
  {
    match: /75th percentile statewide for children per active provider/i,
    toExplained: () => ({
      primary: "More children per engaged provider than most comparable counties",
      secondary: TOP_25_PERCENT.tooltip,
      technical:
        "Above the 75th percentile among comparable counties for children per engaged provider.",
    }),
  },
  {
    match: /75th percentile statewide for out-of-county foster-home placement rate/i,
    toExplained: () => ({
      primary: "Higher out-of-county placement rate than most comparable counties",
      secondary: TOP_25_PERCENT.tooltip,
      technical:
        "Above the 75th percentile among comparable counties for out-of-county foster-home placement rate.",
    }),
  },
  {
    match: /75th percentile statewide for age-group pressure/i,
    toExplained: () => ({
      primary: "Higher age-group pressure than most comparable counties",
      secondary: TOP_25_PERCENT.tooltip,
      technical: "Above the 75th percentile among comparable counties for age-group pressure.",
    }),
  },
  {
    match: /statewide median for children per active provider/i,
    toExplained: () => ({
      primary: "More children per engaged provider than the typical comparable county",
      secondary: "Above the middle of the eligible county comparison group.",
      technical: "Above the median among comparable counties for children per engaged provider.",
    }),
  },
  {
    match: /statewide median for out-of-county foster-home placement rate/i,
    toExplained: () => ({
      primary: "Higher out-of-county placement rate than the typical comparable county",
      secondary: "Above the middle of the eligible county comparison group.",
      technical:
        "Above the median among comparable counties for out-of-county foster-home placement rate.",
    }),
  },
  {
    match: /statewide median for age-group pressure/i,
    toExplained: () => ({
      primary: "Higher age-group pressure than the typical comparable county",
      secondary: "Above the middle of the eligible county comparison group.",
      technical: "Above the median among comparable counties for age-group pressure.",
    }),
  },
  {
    match: /approach expiration within 90 days/i,
    toExplained: () => ({
      primary: "Several provider licenses end within 90 days",
      technical: "Several currently licensed providers approach expiration within 90 days.",
    }),
  },
  {
    match: /does not meet minimum volume rules/i,
    toExplained: () => ({
      primary: "Limited data for a stable county comparison",
      secondary: COMPARABLE_COUNTIES.explanation,
    }),
  },
  {
    match: /Below statewide comparison thresholds/i,
    toExplained: () => ({
      primary: "Below typical comparison levels among eligible counties",
      secondary: COMPARABLE_COUNTIES.explanation,
    }),
  },
];

export function explainRecruitmentReason(reason: string): ExplainedReason {
  const normalized = reason.trim();

  for (const pattern of RECRUITMENT_REASON_PATTERNS) {
    if (pattern.match.test(normalized)) {
      return pattern.toExplained(normalized);
    }
  }

  return {
    primary: normalized,
    technical: normalized.length > 72 ? normalized : undefined,
  };
}

/** Short label for recruitment table attention column. */
export function summarizeRecruitmentReason(reason: string): string {
  return explainRecruitmentReason(reason).primary;
}

export function formatAdditionalFactorsLabel(additionalCount: number): string {
  if (additionalCount <= 0) {
    return "";
  }
  const noun = additionalCount === 1 ? "factor" : "factors";
  return `+${additionalCount} additional ${noun}`;
}

export function formatHighestPressureAgeGroupReason(ageGroup: string | null): string | null {
  if (!ageGroup || ageGroup === "Unknown") {
    return null;
  }

  return `Ages ${ageGroup} show the highest recruitment pressure`;
}
