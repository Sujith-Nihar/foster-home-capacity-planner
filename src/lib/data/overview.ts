import {
  getCachedLargestCounties,
  getCachedMonthlyMetrics,
  getCachedRecruitmentCountyRanking,
  getCachedRetentionPriorityDistribution,
  getCachedRetentionSummaryMetrics,
  getCachedSystemSnapshot,
} from "@/lib/data/cached-snapshot";
import { timedOperation } from "@/lib/performance/timing";
import type {
  CountyMetricsDto,
  DatasetMetadataDto,
  MonthlyMetricsDto,
  OverviewInsightsDto,
  RetentionPriorityDistributionDto,
  SystemSnapshotDto,
} from "@/lib/types/domain";
import { formatCount, formatPercent } from "@/lib/utils/formatters";
import {
  executeSupabaseQuery,
  getServerSupabaseClient,
  type Database,
} from "@/lib/supabase/server";

export async function getDatasetMetadata(): Promise<DatasetMetadataDto> {
  const { getCachedDatasetMetadata } = await import("@/lib/data/cached-snapshot");
  return getCachedDatasetMetadata();
}

export async function getSystemSnapshot(
  reportingDate?: string,
): Promise<SystemSnapshotDto> {
  if (!reportingDate) {
    return getCachedSystemSnapshot();
  }

  const { getCachedReportingDate } = await import("@/lib/data/cached-snapshot");
  if (reportingDate === (await getCachedReportingDate())) {
    return getCachedSystemSnapshot();
  }

  const supabase = getServerSupabaseClient();
  const row = await executeSupabaseQuery<Database["public"]["Tables"]["system_snapshot"]["Row"]>(
    "load system snapshot",
    async () =>
      supabase
        .from("system_snapshot")
        .select(
          "reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, currently_licensed_providers, currently_active_providers, high_recruitment_counties, high_retention_providers",
        )
        .eq("reporting_date", reportingDate)
        .maybeSingle(),
  );

  const { mapSystemSnapshot } = await import("@/lib/supabase/server");
  return mapSystemSnapshot(row);
}

export async function getMonthlyMetrics(limit = 24): Promise<MonthlyMetricsDto[]> {
  return getCachedMonthlyMetrics(limit);
}

export async function getLargestCountiesByFosterPlacements(
  limit = 5,
  reportingDate?: string,
): Promise<CountyMetricsDto[]> {
  if (!reportingDate) {
    return getCachedLargestCounties(limit);
  }

  const { getCachedReportingDate } = await import("@/lib/data/cached-snapshot");
  if (reportingDate === (await getCachedReportingDate())) {
    return getCachedLargestCounties(limit);
  }

  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery("load largest counties by foster placements", async () =>
    supabase
      .from("county_metrics")
      .select(
        "county, reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, licensed_providers, active_providers, inactive_providers, children_per_active_provider, out_of_county_foster_count, out_of_county_foster_rate, expiring_90_days, expiring_180_days, high_retention_providers, medium_retention_providers, highest_pressure_age_group, recruitment_priority, recruitment_reasons",
      )
      .eq("reporting_date", reportingDate)
      .order("current_foster_home_children", { ascending: false })
      .limit(limit),
  );

  const { mapCountyMetrics } = await import("@/lib/supabase/server");
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

async function getRecruitmentCountyRanking(limit: number) {
  return getCachedRecruitmentCountyRanking(limit);
}

async function getRetentionPriorityDistribution() {
  return getCachedRetentionPriorityDistribution();
}

export async function getOverviewPageData() {
  return timedOperation(
    "getOverviewPageData",
    async () => {
      const [
        snapshot,
        monthlyMetrics,
        topRecruitmentCounties,
        retentionDistribution,
        largestCounties,
        retentionSummary,
      ] = await Promise.all([
        getCachedSystemSnapshot(),
        getCachedMonthlyMetrics(24),
        getCachedRecruitmentCountyRanking(10),
        getCachedRetentionPriorityDistribution(),
        getCachedLargestCounties(5),
        getCachedRetentionSummaryMetrics(),
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
    },
    { cache: "hit" },
  );
}
