import type { ProviderActivityPeriodDto, ProviderMetricsDto } from "@/lib/types/domain";
import {
  formatAgePreferenceRange,
  formatBooleanLabel,
  formatCount,
  formatDays,
  formatNullablePercent,
  formatReportingDate,
} from "@/lib/utils/formatters";

export function buildProviderReviewSummary(provider: ProviderMetricsDto): string {
  const placementStatus = formatBooleanLabel(
    provider.currentlyHasPlacement,
    "currently has a foster-home placement",
    "does not currently have a foster-home placement",
  );

  const inactivityDetail =
    provider.daysSinceLastPlacement === null
      ? "Days since last placement are not available."
      : `Last completed placement ended ${formatDays(provider.daysSinceLastPlacement)} ago.`;

  return [
    `Provider ${provider.providerId} in ${provider.county} County ${placementStatus}.`,
    `License runs from ${formatReportingDate(provider.licenseStartDate)} through ${formatReportingDate(provider.licenseEndDate)}, expiring in ${formatDays(provider.daysUntilExpiration)}.`,
    `Preferred age range is ${formatAgePreferenceRange(provider.minAge, provider.maxAge)}.`,
    inactivityDetail,
    `Recorded ${formatCount(provider.totalActiveDays)} total active placement days, including ${formatCount(provider.activeDaysLast365)} active days in the last 365 days across ${formatCount(provider.eligibleLicensedDaysLast365)} eligible licensed days.`,
    `Engagement rate over the last 365 days is ${formatNullablePercent(provider.engagementRateLast365)}.`,
    `Outreach priority is ${provider.outreachPriority}. Triggered reasons: ${provider.outreachReasons.join("; ") || "No elevated outreach signals at the reporting date."}`,
  ].join(" ");
}

export function buildProviderActivitySummary(
  activityPeriods: ProviderActivityPeriodDto[],
): string {
  if (activityPeriods.length === 0) {
    return "No foster-home placement activity periods are recorded for this provider.";
  }

  const periodDescriptions = activityPeriods.map((period) => {
    const currentLabel = period.isCurrent ? " (current period)" : "";
    return `${formatReportingDate(period.periodStart)} to ${formatReportingDate(period.periodEnd)} with ${formatCount(period.activeDays)} active days${currentLabel}`;
  });

  return `This provider has ${formatCount(activityPeriods.length)} recorded activity ${
    activityPeriods.length === 1 ? "period" : "periods"
  }: ${periodDescriptions.join("; ")}.`;
}
