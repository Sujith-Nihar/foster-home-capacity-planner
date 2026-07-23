import { getRecruitmentCounties } from "@/lib/data/recruitment";
import { getRetentionProviders } from "@/lib/data/retention";
import type { CountyMetricsDto, ProviderMetricsDto } from "@/lib/types/domain";
import { MAX_EXPORT_ROWS } from "@/lib/utils/csv";
import {
  formatBooleanLabel,
  formatCountyName,
  formatNullablePercent,
  formatPercent,
  formatRatio,
  formatRecruitmentPriorityLabel,
  formatOutreachPriorityLabel,
  formatReportingDate,
} from "@/lib/utils/formatters";

export type RecruitmentExportRow = {
  county: string;
  recruitment_priority: string;
  current_foster_home_children: number;
  active_providers: number;
  children_per_active_provider: string;
  out_of_county_foster_rate: string;
  highest_pressure_age_group: string;
  expiring_90_days: number;
  recruitment_reasons: string;
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
  return counties.map((county) => ({
    county: county.county,
    recruitment_priority: formatRecruitmentPriorityLabel(county.recruitmentPriority),
    current_foster_home_children: county.currentFosterHomeChildren,
    active_providers: county.activeProviders,
    children_per_active_provider: formatRatio(county.childrenPerActiveProvider),
    out_of_county_foster_rate:
      county.outOfCountyFosterRate === null
        ? "—"
        : formatPercent(county.outOfCountyFosterRate),
    highest_pressure_age_group: county.highestPressureAgeGroup ?? "—",
    expiring_90_days: county.expiring90Days,
    recruitment_reasons: county.recruitmentReasons.join("; "),
  }));
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
    outreach_reasons: provider.outreachReasons.join("; "),
  }));
}

export async function getRecruitmentExportData(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<{ rows: RecruitmentExportRow[]; totalCount: number }> {
  const counties = await getRecruitmentCounties(searchParams);
  return {
    rows: mapRecruitmentExportRows(counties).slice(0, MAX_EXPORT_ROWS),
    totalCount: counties.length,
  };
}

export async function getRetentionExportData(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<{ rows: RetentionExportRow[]; totalCount: number }> {
  const firstPage = await getRetentionProviders({
    ...searchParams,
    page: "1",
    pageSize: String(MAX_EXPORT_ROWS),
  });

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
