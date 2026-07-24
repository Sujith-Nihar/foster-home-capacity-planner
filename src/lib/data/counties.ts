import {
  executeSupabaseQuery,
  getActiveReportingDate,
  getServerSupabaseClient,
  mapCountyAgeMetrics,
  mapCountyMetrics,
  type Database,
} from "@/lib/supabase/server";
import { DataAccessError } from "@/lib/supabase/errors";
import { getRetentionProvidersForCounty } from "@/lib/data/retention";
import { normalizeRouteCounty } from "@/lib/navigation/counties";
import {
  buildCountyLimitations,
  buildCountyPriorityExplanation,
  orderCountyAgeGroups,
} from "@/lib/recruitment/county-detail";
import {
  computeStatewideAgeGroupBenchmarks,
  type StatewideAgeGroupBenchmark,
} from "@/lib/recruitment/age-groups";
import type { CountyAgeMetricsDto, CountyMetricsDto, PaginatedResult, ProviderMetricsDto } from "@/lib/types/domain";

const COUNTY_DETAIL_COLUMNS =
  "county, reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, licensed_providers, active_providers, inactive_providers, children_per_active_provider, out_of_county_foster_count, out_of_county_foster_rate, expiring_90_days, expiring_180_days, high_retention_providers, medium_retention_providers, highest_pressure_age_group, recruitment_priority, recruitment_reasons";

const COUNTY_AGE_COLUMNS =
  "county, age_group, reporting_date, current_foster_home_children, matching_licensed_providers, matching_active_providers, children_per_matching_active_provider";

export type CountyPageData = {
  county: CountyMetricsDto;
  ageGroups: CountyAgeMetricsDto[];
  statewideAgeGroupBenchmarks: StatewideAgeGroupBenchmark[];
  retentionProviders: ProviderMetricsDto[];
  retentionPagination: PaginatedResult<ProviderMetricsDto>;
  priorityExplanation: string;
  limitations: string[];
};

export async function getCountyMetricsByName(
  county: string,
  reportingDate?: string,
) {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const supabase = getServerSupabaseClient();
  const row = await executeSupabaseQuery<Database["public"]["Tables"]["county_metrics"]["Row"]>(
    `load county metrics for ${county}`,
    async () =>
      supabase
        .from("county_metrics")
        .select(COUNTY_DETAIL_COLUMNS)
        .eq("reporting_date", activeReportingDate)
        .eq("county", county)
        .maybeSingle(),
  );

  return mapCountyMetrics(row);
}

export async function getCountyAgeMetrics(
  county: string,
  reportingDate?: string,
) {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery(`load county age metrics for ${county}`, async () =>
    supabase
      .from("county_age_metrics")
      .select(COUNTY_AGE_COLUMNS)
      .eq("reporting_date", activeReportingDate)
      .eq("county", county)
      .order("age_group", { ascending: true }),
  );

  return rows.map(mapCountyAgeMetrics);
}

export async function getAllCountyAgeMetrics(
  reportingDate?: string,
): Promise<CountyAgeMetricsDto[]> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery("load all county age metrics", async () =>
    supabase
      .from("county_age_metrics")
      .select(COUNTY_AGE_COLUMNS)
      .eq("reporting_date", activeReportingDate)
      .order("county", { ascending: true })
      .order("age_group", { ascending: true }),
  );

  return rows.map(mapCountyAgeMetrics);
}

export async function getCountyPageData(
  countyParam: string,
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<CountyPageData | null> {
  const county = normalizeRouteCounty(countyParam);
  if (!county) {
    return null;
  }

  try {
    const [countyMetrics, ageGroups, allCountyAgeGroups, retentionProviders] = await Promise.all([
      getCountyMetricsByName(county),
      getCountyAgeMetrics(county),
      getAllCountyAgeMetrics(),
      getRetentionProvidersForCounty(county, {
        ...searchParams,
        pageSize: searchParams.pageSize ?? "10",
        sort: searchParams.sort ?? "outreach_priority",
        direction: searchParams.direction ?? "asc",
      }),
    ]);

    const orderedAgeGroups = orderCountyAgeGroups(ageGroups);

    return {
      county: countyMetrics,
      ageGroups: orderedAgeGroups,
      statewideAgeGroupBenchmarks: computeStatewideAgeGroupBenchmarks(allCountyAgeGroups),
      retentionProviders: retentionProviders.items,
      retentionPagination: retentionProviders,
      priorityExplanation: buildCountyPriorityExplanation(countyMetrics, orderedAgeGroups, allCountyAgeGroups),
      limitations: buildCountyLimitations(countyMetrics),
    };
  } catch (error) {
    if (error instanceof DataAccessError && error.code === "NOT_FOUND") {
      return null;
    }
    throw error;
  }
}
