import {
  executeSupabaseQuery,
  getActiveReportingDate,
  getServerSupabaseClient,
  mapCountyAgeMetrics,
  mapCountyMetrics,
  type Database,
} from "@/lib/supabase/server";
import { aggregateAgeGroupPressure, partitionRecruitmentCounties, type AgeGroupPressureDto } from "@/lib/recruitment/analytics";
import { sortRecruitmentCounties } from "@/lib/recruitment/query";
import type { CountyMetricsDto, FilterOptionsDto, OutreachPriority, RecruitmentPriority } from "@/lib/types/domain";
import type { AgeGroupLabel } from "@/config/metrics";
import { parseRecruitmentSearchParams } from "@/lib/validation/search-params";

const RECRUITMENT_LIST_COLUMNS =
  "county, reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, licensed_providers, active_providers, inactive_providers, children_per_active_provider, out_of_county_foster_count, out_of_county_foster_rate, expiring_90_days, expiring_180_days, high_retention_providers, medium_retention_providers, highest_pressure_age_group, recruitment_priority, recruitment_reasons";

const COUNTY_AGE_PRESSURE_COLUMNS =
  "county, age_group, reporting_date, current_foster_home_children, matching_licensed_providers, matching_active_providers, children_per_matching_active_provider";

export async function getFilterOptions(
  reportingDate?: string,
): Promise<FilterOptionsDto> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const supabase = getServerSupabaseClient();
  const data = await executeSupabaseQuery<
    Database["public"]["Functions"]["get_application_filter_options"]["Returns"]
  >("load filter options", async () =>
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
}

export async function getRecruitmentCounties(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<CountyMetricsDto[]> {
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

  const counties = rows.map(mapCountyMetrics);
  return sortRecruitmentCounties(counties, params.sort, params.direction);
}

export async function getRecruitmentCountyRanking(
  limit = 10,
  reportingDate?: string,
): Promise<CountyMetricsDto[]> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
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

export async function getAgeGroupPressureRanking(
  reportingDate?: string,
): Promise<AgeGroupPressureDto[]> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery("load county age pressure metrics", async () =>
    supabase
      .from("county_age_metrics")
      .select(COUNTY_AGE_PRESSURE_COLUMNS)
      .eq("reporting_date", activeReportingDate),
  );

  return aggregateAgeGroupPressure(
    rows.map((row) => {
      const mapped = mapCountyAgeMetrics(row);
      return {
        ageGroup: mapped.ageGroup,
        currentFosterHomeChildren: mapped.currentFosterHomeChildren,
        matchingActiveProviders: mapped.matchingActiveProviders,
        childrenPerMatchingActiveProvider: mapped.childrenPerMatchingActiveProvider,
      };
    }),
  );
}

export async function getRecruitmentPageData(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = parseRecruitmentSearchParams(searchParams);
  const [counties, filterOptions, ageGroupPressure] = await Promise.all([
    getRecruitmentCounties(searchParams),
    getFilterOptions(),
    getAgeGroupPressureRanking(),
  ]);

  const { eligible, limitedData } = partitionRecruitmentCounties(counties);

  return {
    counties,
    eligibleCounties: eligible,
    limitedDataCounties: limitedData,
    filterOptions,
    ageGroupPressure,
    searchParams: params,
  };
}
