import { getRecruitmentCounties } from "@/lib/data/recruitment";
import { getRetentionProviders } from "@/lib/data/retention";
import type { CountyMetricsDto, ProviderMetricsDto } from "@/lib/types/domain";
import {
  formatBooleanLabel,
  formatCountyName,
  formatNullablePercent,
  formatPercent,
  formatRatio,
  formatRecruitmentPriorityLabel,
  formatOutreachPriorityLabel,
} from "@/lib/utils/formatters";

export type RecruitmentExportRow = {
  county: string;
  recruitment_priority: string;
  current_foster_home_children: number;
  active_providers: number;
  children_per_active_provider: string;
  out_of_county_foster_rate: string;
  expiring_90_days: number;
  recruitment_reasons: string;
};

export type RetentionExportRow = {
  provider_id: number;
  county: string;
  outreach_priority: string;
  currently_has_placement: string;
  days_until_expiration: number;
  days_since_last_placement: string;
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
    expiring_90_days: county.expiring90Days,
    recruitment_reasons: county.recruitmentReasons.join("; "),
  }));
}

export function mapRetentionExportRows(providers: ProviderMetricsDto[]): RetentionExportRow[] {
  return providers.map((provider) => ({
    provider_id: provider.providerId,
    county: provider.county,
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
    engagement_rate_last_365: formatNullablePercent(provider.engagementRateLast365),
    min_age: provider.minAge,
    max_age: provider.maxAge,
    outreach_reasons: provider.outreachReasons.join("; "),
  }));
}

export async function getRecruitmentExportData(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<RecruitmentExportRow[]> {
  const counties = await getRecruitmentCounties(searchParams);
  return mapRecruitmentExportRows(counties);
}

const MAX_EXPORT_ROWS = 10_000;

export async function getRetentionExportData(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<RetentionExportRow[]> {
  const firstPage = await getRetentionProviders({
    ...searchParams,
    page: "1",
    pageSize: String(MAX_EXPORT_ROWS),
  });

  return mapRetentionExportRows(firstPage.items);
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
