import { RECRUITMENT_MINIMUM_VOLUME } from "@/config/metrics";
import type { CountyMetricsDto } from "@/lib/types/domain";

export type ComparisonStatus = "Eligible" | "Limited data";
export type SuggestedRecruitmentAttention = "High" | "Medium" | "Low" | "Not scored";

export const COMPARISON_STATUS_FILTERS = ["eligible", "all", "limited"] as const;
export type ComparisonStatusFilter = (typeof COMPARISON_STATUS_FILTERS)[number];

export const RECRUITMENT_ATTENTION_LEVELS = ["High", "Medium", "Low"] as const;
export type RecruitmentAttentionLevel = (typeof RECRUITMENT_ATTENTION_LEVELS)[number];

export function isLimitedDataCounty(
  county: Pick<CountyMetricsDto, "recruitmentPriority">,
): boolean {
  return county.recruitmentPriority === "Limited data";
}

export function getComparisonStatus(
  county: Pick<CountyMetricsDto, "recruitmentPriority">,
): ComparisonStatus {
  return isLimitedDataCounty(county) ? "Limited data" : "Eligible";
}

export function getSuggestedRecruitmentAttention(
  county: Pick<CountyMetricsDto, "recruitmentPriority">,
): SuggestedRecruitmentAttention {
  if (isLimitedDataCounty(county)) {
    return "Not scored";
  }

  return county.recruitmentPriority as RecruitmentAttentionLevel;
}

export function buildDataSufficiencyReason(
  county: Pick<
    CountyMetricsDto,
    "currentFosterHomeChildren" | "activeProviders" | "recruitmentPriority"
  >,
): string {
  if (!isLimitedDataCounty(county)) {
    return "";
  }

  const childrenShort =
    county.currentFosterHomeChildren < RECRUITMENT_MINIMUM_VOLUME.currentFosterHomeChildren;
  const providersShort =
    county.activeProviders < RECRUITMENT_MINIMUM_VOLUME.activeProviders;

  if (childrenShort && providersShort) {
    return "Not scored because both comparison minimums are unmet.";
  }

  if (childrenShort) {
    return `Not scored because the county has ${county.currentFosterHomeChildren} current foster-home children; at least ${RECRUITMENT_MINIMUM_VOLUME.currentFosterHomeChildren} are required.`;
  }

  return `Not scored because the county has ${county.activeProviders} engaged providers; at least ${RECRUITMENT_MINIMUM_VOLUME.activeProviders} are required.`;
}

export function filterCountiesByComparisonStatus<
  T extends Pick<CountyMetricsDto, "recruitmentPriority">,
>(counties: T[], comparisonStatus: ComparisonStatusFilter): T[] {
  if (comparisonStatus === "all") {
    return counties;
  }

  if (comparisonStatus === "limited") {
    return counties.filter(isLimitedDataCounty);
  }

  return counties.filter((county) => !isLimitedDataCounty(county));
}
