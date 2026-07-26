import { formatPercent } from "@/lib/utils/formatters";
import { RETENTION_THRESHOLDS } from "@/config/metrics";

export type OutreachReasonContext = {
  daysSinceLastPlacement: number | null;
  daysUntilExpiration: number;
  currentlyHasPlacement: boolean;
  engagementRateLast365: number | null;
  eligibleLicensedDaysLast365?: number;
  activeDaysLast365?: number;
};

export type ExplainedOutreachReason = {
  primary: string;
  technical: string;
  triggeredRule?: string;
  actualValue?: string;
};

export function formatOutreachReasonForDisplay(
  reason: string,
  context: OutreachReasonContext,
): string {
  return explainOutreachReason(reason, context).primary;
}

export function getPrimaryOutreachReasonForDisplay(
  reasons: string[],
  context: OutreachReasonContext,
): string | null {
  if (reasons.length === 0) {
    return null;
  }

  return formatOutreachReasonForDisplay(reasons[0], context);
}

export function explainOutreachReason(
  reason: string,
  context: OutreachReasonContext,
): ExplainedOutreachReason {
  if (reason === "No elevated outreach signals at the reporting date") {
    return {
      primary: "No elevated outreach signals",
      technical: reason,
    };
  }

  if (reason === "Inactive for at least 180 days") {
    return {
      primary:
        context.daysSinceLastPlacement !== null && context.daysSinceLastPlacement >= 180
          ? "No placement activity for an extended period"
          : context.daysSinceLastPlacement !== null
            ? `No current placement for ${context.daysSinceLastPlacement} days`
            : "No placement activity for an extended period",
      technical: reason,
      triggeredRule: reason,
      actualValue:
        context.daysSinceLastPlacement !== null
          ? `${context.daysSinceLastPlacement} days since the most recent completed placement`
          : undefined,
    };
  }

  if (reason === "Inactive for at least 90 days") {
    return {
      primary:
        context.daysSinceLastPlacement !== null
          ? `No current placement for ${context.daysSinceLastPlacement} days`
          : "No current placement for an extended period",
      technical: reason,
      triggeredRule: reason,
      actualValue:
        context.daysSinceLastPlacement !== null
          ? `${context.daysSinceLastPlacement} days since the most recent completed placement`
          : undefined,
    };
  }

  if (
    reason.includes("license expiring within 90 days") &&
    reason.includes("inactive for at least 60")
  ) {
    return {
      primary: `No current placement and license ends in ${context.daysUntilExpiration} days`,
      technical: reason,
      triggeredRule: "Inactive for at least 60 days with a license ending within 90 days",
      actualValue:
        context.daysSinceLastPlacement !== null
          ? `${context.daysSinceLastPlacement} days since the most recent completed placement`
          : undefined,
    };
  }

  if (reason === "Inactive with license expiring within 180 days") {
    return {
      primary: `No current placement and license ends in ${context.daysUntilExpiration} days`,
      technical: reason,
      triggeredRule: reason,
      actualValue: `${context.daysUntilExpiration} days until license expiration`,
    };
  }

  if (reason.includes("Engagement below 10%")) {
    return {
      primary: "Limited placement activity during the past 12 months",
      technical: reason,
      triggeredRule: `Recent placement activity below 10% after at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days`,
      actualValue: formatEngagementActualValue(context),
    };
  }

  if (reason.includes("Very low engagement while inactive")) {
    return {
      primary: "Limited placement activity during the past 12 months",
      technical: reason,
      triggeredRule: `Recent placement activity below ${formatPercent(RETENTION_THRESHOLDS.highEngagementRateMax, 0)} after at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days`,
      actualValue: formatEngagementActualValue(context),
    };
  }

  if (reason.includes("Engagement below 25%")) {
    return {
      primary: "Limited placement activity during the past 12 months",
      technical: reason,
      triggeredRule: `Recent placement activity below ${formatPercent(RETENTION_THRESHOLDS.mediumEngagementRateMax, 0)} after at least ${RETENTION_THRESHOLDS.minEligibleLicensedDays} eligible licensed days`,
      actualValue: formatEngagementActualValue(context),
    };
  }

  if (reason === "Currently active with very low annual engagement") {
    return {
      primary: "Limited placement activity during the past 12 months",
      technical: reason,
      triggeredRule: `Recent placement activity below ${formatPercent(RETENTION_THRESHOLDS.highEngagementRateMax, 0)} while currently active`,
      actualValue: formatEngagementActualValue(context),
    };
  }

  if (reason === "Currently active with license expiring within 60 days") {
    return {
      primary: "Has a current placement, but license ends soon",
      technical: reason,
      triggeredRule: reason,
      actualValue: `${context.daysUntilExpiration} days until license expiration`,
    };
  }

  return {
    primary: reason,
    technical: reason,
  };
}

function formatEngagementActualValue(context: OutreachReasonContext): string | undefined {
  if (context.engagementRateLast365 === null) {
    return undefined;
  }

  const rate = `${(context.engagementRateLast365 * 100).toFixed(1)}% recent placement activity`;
  if (context.activeDaysLast365 !== undefined && context.eligibleLicensedDaysLast365 !== undefined) {
    return `${rate} (${context.activeDaysLast365} active days across ${context.eligibleLicensedDaysLast365} eligible licensed days)`;
  }

  return rate;
}
