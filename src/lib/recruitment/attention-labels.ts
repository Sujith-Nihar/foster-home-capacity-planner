import type { SuggestedRecruitmentAttention } from "@/lib/recruitment/classification";

export type RecruitmentAttentionBadgeLevel = "high" | "medium" | "low" | "limited";

export function getRecruitmentAttentionBadgeLevel(
  attention: SuggestedRecruitmentAttention,
  isLimitedData: boolean,
): RecruitmentAttentionBadgeLevel {
  if (isLimitedData || attention === "Not scored") {
    return "limited";
  }

  switch (attention) {
    case "High":
      return "high";
    case "Medium":
      return "medium";
    case "Low":
      return "low";
  }
}

export function formatRecruitmentAttentionAccessibleLabel(
  attention: SuggestedRecruitmentAttention,
  isLimitedData: boolean,
): string {
  if (isLimitedData || attention === "Not scored") {
    return "Limited data";
  }

  return `${attention} suggested attention`;
}

export function formatRecruitmentAttentionBadgeLabel(
  attention: SuggestedRecruitmentAttention,
  isLimitedData: boolean,
  variant: "full" | "compact" = "full",
): string {
  if (isLimitedData || attention === "Not scored") {
    return "Limited data";
  }

  if (variant === "compact") {
    return `${attention} attention`;
  }

  return `${attention} suggested attention`;
}

export function getRecruitmentAttentionBadgeTitle(
  attention: SuggestedRecruitmentAttention,
  isLimitedData: boolean,
): string {
  if (isLimitedData || attention === "Not scored") {
    return "Limited data";
  }

  return `${attention} recruitment attention`;
}

export function getRecruitmentAttentionBadgeExplanation(
  attention: SuggestedRecruitmentAttention,
  isLimitedData: boolean,
): string {
  if (isLimitedData || attention === "Not scored") {
    return "This county does not have enough children or engaged providers for a stable comparison.";
  }

  switch (attention) {
    case "High":
      return "At least 2 of the 3 recruitment signals rank among the highest quarter of comparable counties.";
    case "Medium":
      return "One recruitment signal ranks in the highest quarter, or at least two are above the typical comparable county.";
    case "Low":
      return "This county does not meet the High or Medium recruitment-attention rules.";
  }
}
