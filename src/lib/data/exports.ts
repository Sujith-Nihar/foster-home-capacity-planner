import { getRecruitmentCountiesForExport } from "@/lib/data/recruitment";
import { getRetentionExportProviders } from "@/lib/data/retention";
import {
  buildDataSufficiencyReason,
  getComparisonStatus,
  getSuggestedRecruitmentAttention,
} from "@/lib/recruitment/classification";
import { summarizeRecruitmentReason } from "@/lib/recruitment/summary-labels";
import { formatOutreachReasonForDisplay } from "@/lib/retention/reason-display";
import type { CountyMetricsDto, ProviderMetricsDto } from "@/lib/types/domain";
import { MAX_EXPORT_ROWS } from "@/lib/utils/csv";
import {
  formatBooleanLabel,
  formatComparisonStatusLabel,
  formatCountyName,
  formatNullablePercent,
  formatOutreachPriorityLabel,
  formatRatio,
  formatReportingDate,
  formatSuggestedRecruitmentAttentionLabel,
} from "@/lib/utils/formatters";

export type RecruitmentExportRow = {
  county: string;
  comparison_status: string;
  suggested_recruitment_attention: string;
  current_foster_home_children: number;
  engaged_providers: number;
  children_per_engaged_provider: string;
  out_of_county_foster_rate: string;
  highest_pressure_age_group: string;
  licenses_expiring_within_90_days: number;
  recruitment_reasons: string;
  data_sufficiency_reason: string;
};

export type RetentionExportRow = {
  provider_id: number;
  county: string;
  license_end_date: string;
  outreach_priority: string;
  currently_has_placement: string;
  days_until_expiration: number;
  days_since_last_placement: string;
  active_days_last_365: number;
  engagement_rate_last_365: string;
  min_age: number;
  max_age: number;
  outreach_reasons: string;
};

export function mapRecruitmentExportRows(counties: CountyMetricsDto[]): RecruitmentExportRow[] {
  return counties.map((county) => {
    const comparisonStatus = getComparisonStatus(county);
    const suggestedAttention = getSuggestedRecruitmentAttention(county);
    const isLimitedData = comparisonStatus === "Limited data";

    return {
      county: county.county,
      comparison_status: formatComparisonStatusLabel(comparisonStatus),
      suggested_recruitment_attention: formatSuggestedRecruitmentAttentionLabel(suggestedAttention),
      current_foster_home_children: county.currentFosterHomeChildren,
      engaged_providers: county.activeProviders,
      children_per_engaged_provider: formatRatio(county.childrenPerActiveProvider),
      out_of_county_foster_rate:
        county.outOfCountyFosterRate === null
          ? "—"
          : formatNullablePercent(county.outOfCountyFosterRate),
      highest_pressure_age_group: county.highestPressureAgeGroup ?? "—",
      licenses_expiring_within_90_days: county.expiring90Days,
      recruitment_reasons: isLimitedData
        ? ""
        : county.recruitmentReasons.map((reason) => summarizeRecruitmentReason(reason)).join("; "),
      data_sufficiency_reason: isLimitedData ? buildDataSufficiencyReason(county) : "",
    };
  });
}

export function mapRetentionExportRows(providers: ProviderMetricsDto[]): RetentionExportRow[] {
  return providers.map((provider) => ({
    provider_id: provider.providerId,
    county: provider.county,
    license_end_date: formatReportingDate(provider.licenseEndDate),
    outreach_priority: formatOutreachPriorityLabel(provider.outreachPriority),
    currently_has_placement: formatBooleanLabel(
      provider.currentlyHasPlacement,
      "Active",
      "Inactive",
    ),
    days_until_expiration: provider.daysUntilExpiration,
    days_since_last_placement:
      provider.daysSinceLastPlacement === null
        ? "—"
        : String(provider.daysSinceLastPlacement),
    active_days_last_365: provider.activeDaysLast365,
    engagement_rate_last_365: formatNullablePercent(provider.engagementRateLast365),
    min_age: provider.minAge,
    max_age: provider.maxAge,
    outreach_reasons: provider.outreachReasons
      .map((reason) =>
        formatOutreachReasonForDisplay(reason, {
          daysSinceLastPlacement: provider.daysSinceLastPlacement,
          daysUntilExpiration: provider.daysUntilExpiration,
          currentlyHasPlacement: provider.currentlyHasPlacement,
          engagementRateLast365: provider.engagementRateLast365,
          eligibleLicensedDaysLast365: provider.eligibleLicensedDaysLast365,
          activeDaysLast365: provider.activeDaysLast365,
        }),
      )
      .join("; "),
  }));
}

export async function getRecruitmentExportData(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<{ rows: RecruitmentExportRow[]; totalCount: number }> {
  const counties = await getRecruitmentCountiesForExport(searchParams);
  return {
    rows: mapRecruitmentExportRows(counties).slice(0, MAX_EXPORT_ROWS),
    totalCount: counties.length,
  };
}

export async function getRetentionExportData(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<{ rows: RetentionExportRow[]; totalCount: number }> {
  const firstPage = await getRetentionExportProviders(searchParams);

  return {
    rows: mapRetentionExportRows(firstPage.items),
    totalCount: firstPage.totalCount,
  };
}

export function recruitmentExportFilename(reportingDate: string): string {
  return `recruitment-counties-${reportingDate}.csv`;
}

export function retentionExportFilename(reportingDate: string): string {
  return `retention-providers-${reportingDate}.csv`;
}

export function formatCountyExportLabel(county: string): string {
  return formatCountyName(county);
}
