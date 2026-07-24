import {
  getServerSupabaseClient,
  executeSupabaseQuery,
  getActiveReportingDate,
  mapCountyMetrics,
  mapDatasetMetadata,
  mapMonthlyMetrics,
  mapSystemSnapshot,
  type Database,
} from "@/lib/supabase/server";
import type {
  CountyMetricsDto,
  DatasetMetadataDto,
  MonthlyMetricsDto,
  OverviewInsightsDto,
  RetentionPriorityDistributionDto,
  SystemSnapshotDto,
} from "@/lib/types/domain";
import { formatCount, formatPercent } from "@/lib/utils/formatters";
import { getRecruitmentCountyRanking } from "@/lib/data/recruitment";
import { getRetentionPriorityDistribution, getRetentionSummaryMetrics } from "@/lib/data/retention";

export async function getDatasetMetadata(): Promise<DatasetMetadataDto> {
  const supabase = getServerSupabaseClient();
  const row = await executeSupabaseQuery<Database["public"]["Tables"]["dataset_metadata"]["Row"]>(
    "load dataset metadata",
    async () =>
      supabase
        .from("dataset_metadata")
        .select(
          "dataset_version, reporting_date, generated_at, source_hash, etl_version, provider_count, child_count, placement_count",
        )
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
  );

  return mapDatasetMetadata(row);
}

export async function getSystemSnapshot(
  reportingDate?: string,
): Promise<SystemSnapshotDto> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const supabase = getServerSupabaseClient();
  const row = await executeSupabaseQuery<Database["public"]["Tables"]["system_snapshot"]["Row"]>(
    "load system snapshot",
    async () =>
      supabase
        .from("system_snapshot")
        .select(
          "reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, currently_licensed_providers, currently_active_providers, high_recruitment_counties, high_retention_providers",
        )
        .eq("reporting_date", activeReportingDate)
        .maybeSingle(),
  );

  return mapSystemSnapshot(row);
}

export async function getMonthlyMetrics(limit = 24): Promise<MonthlyMetricsDto[]> {
  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery("load monthly metrics", async () =>
    supabase
      .from("monthly_metrics")
      .select(
        "month, new_license_starts, license_expirations, active_provider_count, foster_home_placement_starts",
      )
      .order("month", { ascending: false })
      .limit(limit),
  );

  return rows.map(mapMonthlyMetrics).reverse();
}

export async function getLargestCountiesByFosterPlacements(
  limit = 5,
  reportingDate?: string,
): Promise<CountyMetricsDto[]> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery("load largest counties by foster placements", async () =>
    supabase
      .from("county_metrics")
      .select(
        "county, reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, licensed_providers, active_providers, inactive_providers, children_per_active_provider, out_of_county_foster_count, out_of_county_foster_rate, expiring_90_days, expiring_180_days, high_retention_providers, medium_retention_providers, highest_pressure_age_group, recruitment_priority, recruitment_reasons",
      )
      .eq("reporting_date", activeReportingDate)
      .order("current_foster_home_children", { ascending: false })
      .limit(limit),
  );

  return rows.map(mapCountyMetrics);
}

export function buildOverviewAttentionBullets(input: {
  snapshot: SystemSnapshotDto;
  topRecruitmentCounties: Array<{
    county: string;
    childrenPerActiveProvider: number | null;
    recruitmentPriority: string;
  }>;
  retentionDistribution: RetentionPriorityDistributionDto;
}): string[] {
  const { snapshot, topRecruitmentCounties, retentionDistribution } = input;
  const bullets: string[] = [
    `${formatCount(snapshot.currentFosterHomeChildren)} children are in foster-home placements statewide, with ${formatCount(snapshot.currentKinChildren)} in kin care and ${formatCount(snapshot.currentNonfamilyChildren)} in nonfamily placements.`,
    `${formatCount(snapshot.highRecruitmentCounties)} counties have high suggested recruitment attention and ${formatCount(snapshot.highRetentionProviders)} licensed providers have high outreach priority.`,
    `${formatCount(retentionDistribution.high)} providers are classified as high outreach priority, ${formatCount(retentionDistribution.medium)} as medium, and ${formatCount(retentionDistribution.low)} as low.`,
  ];

  const topCounty = topRecruitmentCounties[0];
  if (topCounty?.childrenPerActiveProvider != null) {
    bullets.push(
      `${topCounty.county} County shows the highest children-per-active-provider ratio among ranked counties at ${topCounty.childrenPerActiveProvider.toFixed(2)}.`,
    );
  }

  return bullets;
}

export function buildOverviewInsights(input: {
  snapshot: SystemSnapshotDto;
  topRecruitmentCounties: Array<{
    county: string;
    childrenPerActiveProvider: number | null;
    recruitmentPriority: string;
  }>;
  retentionDistribution: RetentionPriorityDistributionDto;
}): OverviewInsightsDto {
  const { snapshot } = input;
  const fosterShare =
    snapshot.currentChildrenInCare > 0
      ? snapshot.currentFosterHomeChildren / snapshot.currentChildrenInCare
      : 0;

  return {
    headline: `${formatPercent(fosterShare)} of children currently in care are placed in foster homes at the ${snapshot.reportingDate} reporting date.`,
    bullets: buildOverviewAttentionBullets(input),
  };
}

export async function getOverviewInsights(): Promise<OverviewInsightsDto> {
  const [snapshot, topRecruitmentCounties, retentionDistribution] = await Promise.all([
    getSystemSnapshot(),
    getRecruitmentCountyRanking(5),
    getRetentionPriorityDistribution(),
  ]);

  return buildOverviewInsights({
    snapshot,
    topRecruitmentCounties,
    retentionDistribution,
  });
}

export async function getOverviewPageData() {
  const [
    snapshot,
    monthlyMetrics,
    topRecruitmentCounties,
    retentionDistribution,
    largestCounties,
    retentionSummary,
  ] = await Promise.all([
    getSystemSnapshot(),
    getMonthlyMetrics(24),
    getRecruitmentCountyRanking(10),
    getRetentionPriorityDistribution(),
    getLargestCountiesByFosterPlacements(5),
    getRetentionSummaryMetrics(),
  ]);

  const insights = buildOverviewInsights({
    snapshot,
    topRecruitmentCounties,
    retentionDistribution,
  });

  return {
    snapshot,
    monthlyMetrics,
    topRecruitmentCounties,
    retentionDistribution,
    largestCounties,
    retentionSummary,
    insights,
  };
}
