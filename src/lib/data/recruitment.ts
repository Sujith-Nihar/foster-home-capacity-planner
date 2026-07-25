import {
  deriveAgeGroupPressureFromCountyAgeMetrics,
  getCachedCountyAgeMetrics,
  getCachedFilterOptions,
  getCachedRecruitmentCountyRanking,
  getCachedReportingDate,
} from "@/lib/data/cached-snapshot";
import { timedOperation } from "@/lib/performance/timing";
import { filterCountiesBySearch } from "@/lib/filters/county-search";
import { cache } from "react";
import {
  executeSupabaseQuery,
  getActiveReportingDate,
  getServerSupabaseClient,
  mapCountyAgeMetrics,
  mapCountyMetrics,
} from "@/lib/supabase/server";
import { partitionRecruitmentCounties, type AgeGroupPressureDto } from "@/lib/recruitment/analytics";
import { groupCountyAgeMetricsByCounty, computeStatewideAgeGroupBenchmarks } from "@/lib/recruitment/age-groups";
import { sortRecruitmentCounties } from "@/lib/recruitment/query";
import type { CountyAgeMetricsDto, CountyMetricsDto, FilterOptionsDto, OutreachPriority, RecruitmentPriority } from "@/lib/types/domain";
import type { AgeGroupLabel } from "@/config/metrics";
import { parseRecruitmentSearchParams } from "@/lib/validation/search-params";

const RECRUITMENT_LIST_COLUMNS =
  "county, reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, licensed_providers, active_providers, inactive_providers, children_per_active_provider, out_of_county_foster_count, out_of_county_foster_rate, expiring_90_days, expiring_180_days, high_retention_providers, medium_retention_providers, highest_pressure_age_group, recruitment_priority, recruitment_reasons";

const COUNTY_AGE_COLUMNS =
  "county, age_group, reporting_date, current_foster_home_children, matching_licensed_providers, matching_active_providers, children_per_matching_active_provider";

export async function getFilterOptions(
  reportingDate?: string,
): Promise<FilterOptionsDto> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  if (activeReportingDate === (await getCachedReportingDate())) {
    return getCachedFilterOptions();
  }

  return timedOperation(
    "getFilterOptions",
    async () => {
      const supabase = getServerSupabaseClient();
      const data = await executeSupabaseQuery("load filter options", async () =>
        supabase.rpc("get_application_filter_options", {
          reporting_date_param: activeReportingDate,
        }),
      );

      return {
        reportingDate: data.reporting_date,
        counties: data.counties ?? [],
        recruitmentPriorities: (data.recruitment_priorities ?? []) as RecruitmentPriority[],
        outreachPriorities: (data.outreach_priorities ?? []) as OutreachPriority[],
        ageGroups: (data.age_groups ?? []) as AgeGroupLabel[],
      };
    },
    { cache: "miss" },
  );
}

export const getRecruitmentCounties = cache(async function getRecruitmentCounties(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<CountyMetricsDto[]> {
  return timedOperation(
    "getRecruitmentCounties",
    async () => {
      const params = parseRecruitmentSearchParams(searchParams);
      const reportingDate = await getActiveReportingDate();
      const supabase = getServerSupabaseClient();

      let query = supabase
        .from("county_metrics")
        .select(RECRUITMENT_LIST_COLUMNS)
        .eq("reporting_date", reportingDate);

      if (params.priority) {
        query = query.eq("recruitment_priority", params.priority);
      }

      if (params.minFosterChildren !== undefined) {
        query = query.gte("current_foster_home_children", params.minFosterChildren);
      }

      if (params.ageGroup) {
        query = query.eq("highest_pressure_age_group", params.ageGroup);
      }

      if (params.minOutOfCountyRate !== undefined) {
        query = query.gte("out_of_county_foster_rate", params.minOutOfCountyRate);
      }

      if (params.maxOutOfCountyRate !== undefined) {
        query = query.lte("out_of_county_foster_rate", params.maxOutOfCountyRate);
      }

      const sortField =
        params.sort === "recruitment_priority" ? "children_per_active_provider" : params.sort;

      const rows = await executeSupabaseQuery("load recruitment counties", async () =>
        query.order(sortField, {
          ascending: params.direction === "asc",
          nullsFirst: false,
        }),
      );

      let counties = rows.map(mapCountyMetrics);
      counties = filterCountiesBySearch(counties, params.county);
      return sortRecruitmentCounties(counties, params.sort, params.direction);
    },
    { rowCount: (counties) => counties.length, cache: "miss" },
  );
});

export async function getRecruitmentCountyRanking(
  limit = 10,
  reportingDate?: string,
): Promise<CountyMetricsDto[]> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  if (!reportingDate || reportingDate === (await getCachedReportingDate())) {
    return getCachedRecruitmentCountyRanking(limit);
  }

  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery("load recruitment county ranking", async () =>
    supabase
      .from("county_metrics")
      .select(RECRUITMENT_LIST_COLUMNS)
      .eq("reporting_date", activeReportingDate)
      .neq("recruitment_priority", "Limited data")
      .order("children_per_active_provider", { ascending: false, nullsFirst: false })
      .limit(limit),
  );

  return rows.map(mapCountyMetrics);
}

async function loadCountyAgeMetrics(reportingDate: string): Promise<CountyAgeMetricsDto[]> {
  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery("load all county age metrics", async () =>
    supabase
      .from("county_age_metrics")
      .select(COUNTY_AGE_COLUMNS)
      .eq("reporting_date", reportingDate)
      .order("county", { ascending: true })
      .order("age_group", { ascending: true }),
  );

  return rows.map(mapCountyAgeMetrics);
}

export async function getAgeGroupPressureRanking(
  reportingDate?: string,
): Promise<AgeGroupPressureDto[]> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const countyAgeMetrics =
    activeReportingDate === (await getCachedReportingDate())
      ? await getCachedCountyAgeMetrics()
      : await loadCountyAgeMetrics(activeReportingDate);

  return deriveAgeGroupPressureFromCountyAgeMetrics(countyAgeMetrics);
}

export async function getRecruitmentPageData(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return timedOperation(
    "getRecruitmentPageData",
    async () => {
      const params = parseRecruitmentSearchParams(searchParams);
      const [counties, filterOptions, allCountyAgeMetrics] = await Promise.all([
        getRecruitmentCounties(searchParams),
        getFilterOptions(),
        getCachedCountyAgeMetrics(),
      ]);

      const ageGroupPressure = deriveAgeGroupPressureFromCountyAgeMetrics(allCountyAgeMetrics);
      const { eligible, limitedData } = partitionRecruitmentCounties(counties);

      return {
        counties,
        eligibleCounties: eligible,
        limitedDataCounties: limitedData,
        filterOptions,
        ageGroupPressure,
        countyAgeMetricsByCounty: groupCountyAgeMetricsByCounty(allCountyAgeMetrics),
        statewideAgeGroupBenchmarks: computeStatewideAgeGroupBenchmarks(allCountyAgeMetrics),
        searchParams: params,
      };
    },
    { cache: "miss" },
  );
}

export type CountyAgeMetricsByCounty = Map<string, CountyAgeMetricsDto[]>;

export async function getAllCountyAgeMetrics(
  reportingDate?: string,
): Promise<CountyAgeMetricsDto[]> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  if (!reportingDate || activeReportingDate === (await getCachedReportingDate())) {
    return getCachedCountyAgeMetrics();
  }

  return loadCountyAgeMetrics(activeReportingDate);
}
