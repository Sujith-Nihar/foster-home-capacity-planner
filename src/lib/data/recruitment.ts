import {
  deriveAgeGroupPressureFromCountyAgeMetrics,
  getCachedCountyAgeMetrics,
  getCachedFilterOptions,
  getCachedRecruitmentCountyRanking,
  getCachedReportingDate,
} from "@/lib/data/cached-snapshot";
import { filterCountiesBySearch } from "@/lib/filters/county-search";
import { RECRUITMENT_DEFAULT_PAGE_SIZE } from "@/lib/pagination/constants";
import { computeTotalPages, normalizePage } from "@/lib/pagination/range";
import { partitionRecruitmentCounties, type AgeGroupPressureDto } from "@/lib/recruitment/analytics";
import { groupCountyAgeMetricsByCounty, computeStatewideAgeGroupBenchmarks } from "@/lib/recruitment/age-groups";
import { sortRecruitmentCounties } from "@/lib/recruitment/query";
import { timedOperation, isPerformanceLoggingEnabled } from "@/lib/performance/timing";
import { cache } from "react";
import {
  executeSupabaseQuery,
  getActiveReportingDate,
  getServerSupabaseClient,
  mapCountyAgeMetrics,
  mapCountyMetrics,
} from "@/lib/supabase/server";
import { wrapDataAccessError } from "@/lib/supabase/errors";
import type {
  CountyAgeMetricsDto,
  CountyMetricsDto,
  FilterOptionsDto,
  OutreachPriority,
  PaginatedResult,
  RecruitmentPriority,
} from "@/lib/types/domain";
import type { AgeGroupLabel } from "@/config/metrics";
import {
  parseRecruitmentSearchParams,
  type RecruitmentSearchParams,
} from "@/lib/validation/search-params";

const RECRUITMENT_LIST_COLUMNS =
  "county, reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, licensed_providers, active_providers, inactive_providers, children_per_active_provider, out_of_county_foster_count, out_of_county_foster_rate, expiring_90_days, expiring_180_days, high_retention_providers, medium_retention_providers, highest_pressure_age_group, recruitment_priority, recruitment_reasons";

const COUNTY_AGE_COLUMNS =
  "county, age_group, reporting_date, current_foster_home_children, matching_licensed_providers, matching_active_providers, children_per_matching_active_provider";

const MAX_RECRUITMENT_EXPORT_ROWS = 500;

function logRecruitmentQuery(entry: {
  operation: string;
  filters: Record<string, unknown>;
  page: number;
  page_size: number;
  returned_row_count: number;
  total_count: number;
  duration_ms: number;
  success: boolean;
}) {
  if (!isPerformanceLoggingEnabled()) {
    return;
  }

  console.info(JSON.stringify(entry));
}

function buildPaginatedResult(
  items: CountyMetricsDto[],
  page: number,
  pageSize: number,
  totalCount: number,
): PaginatedResult<CountyMetricsDto> {
  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages: computeTotalPages(totalCount, pageSize),
  };
}

async function resolveCountyNamesForSearch(
  searchQuery: string | undefined,
): Promise<string[] | undefined> {
  if (!searchQuery?.trim()) {
    return undefined;
  }

  const filterOptions = await getFilterOptions();
  return filterCountiesBySearch(
    filterOptions.counties.map((county) => ({ county })),
    searchQuery,
  ).map((item) => item.county);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyRecruitmentFilters(query: any, params: RecruitmentSearchParams, reportingDate: string, countyNames?: string[]) {
  let builder = query.eq("reporting_date", reportingDate);

  if (countyNames) {
    builder = builder.in("county", countyNames);
  }

  if (params.priority) {
    builder = builder.eq("recruitment_priority", params.priority);
  }

  if (params.comparisonStatus === "eligible") {
    builder = builder.neq("recruitment_priority", "Limited data");
  } else if (params.comparisonStatus === "limited") {
    builder = builder.eq("recruitment_priority", "Limited data");
  }

  if (params.minFosterChildren !== undefined) {
    builder = builder.gte("current_foster_home_children", params.minFosterChildren);
  }

  if (params.ageGroup) {
    builder = builder.eq("highest_pressure_age_group", params.ageGroup);
  }

  if (params.minOutOfCountyRate !== undefined) {
    builder = builder.gte("out_of_county_foster_rate", params.minOutOfCountyRate);
  }

  if (params.maxOutOfCountyRate !== undefined) {
    builder = builder.lte("out_of_county_foster_rate", params.maxOutOfCountyRate);
  }

  return builder;
}

async function listRecruitmentCounties(
  params: RecruitmentSearchParams,
  options: { paginate: boolean },
): Promise<PaginatedResult<CountyMetricsDto>> {
  const startedAt = performance.now();
  const reportingDate = await getActiveReportingDate();
  const supabase = getServerSupabaseClient();
  const countyNames = await resolveCountyNamesForSearch(params.county);

  if (countyNames && countyNames.length === 0) {
    const empty = buildPaginatedResult([], 1, params.pageSize, 0);
    logRecruitmentQuery({
      operation: options.paginate ? "listRecruitmentCounties" : "exportRecruitmentCounties",
      filters: { ...params },
      page: params.page,
      page_size: params.pageSize,
      returned_row_count: 0,
      total_count: 0,
      duration_ms: Math.round(performance.now() - startedAt),
      success: true,
    });
    return empty;
  }

  const buildQuery = () =>
    applyRecruitmentFilters(
      supabase.from("county_metrics").select(RECRUITMENT_LIST_COLUMNS, { count: "exact" }),
      params,
      reportingDate,
      countyNames,
    );

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  if (!options.paginate) {
    const sortField =
      params.sort === "recruitment_priority" ? "children_per_active_provider" : params.sort;
    const { data, error, count } = await buildQuery()
      .order(sortField, { ascending: params.direction === "asc", nullsFirst: false })
      .order("county", { ascending: true, nullsFirst: false })
      .range(0, MAX_RECRUITMENT_EXPORT_ROWS - 1);

    if (error) {
      throw wrapDataAccessError("load recruitment counties for export", error);
    }

    const counties: CountyMetricsDto[] = sortRecruitmentCounties(
      (data ?? []).map(mapCountyMetrics),
      params.sort,
      params.direction,
    );

    logRecruitmentQuery({
      operation: "exportRecruitmentCounties",
      filters: { ...params },
      page: 1,
      page_size: counties.length,
      returned_row_count: counties.length,
      total_count: count ?? counties.length,
      duration_ms: Math.round(performance.now() - startedAt),
      success: true,
    });

    return buildPaginatedResult(counties, 1, counties.length || RECRUITMENT_DEFAULT_PAGE_SIZE, count ?? counties.length);
  }

  if (params.sort === "recruitment_priority") {
    const { data, error, count } = await buildQuery()
      .order("county", { ascending: true, nullsFirst: false })
      .range(0, MAX_RECRUITMENT_EXPORT_ROWS - 1);

    if (error) {
      throw wrapDataAccessError("load recruitment counties", error);
    }

    const sortedItems: CountyMetricsDto[] = sortRecruitmentCounties(
      (data ?? []).map(mapCountyMetrics),
      params.sort,
      params.direction,
    );
    const totalCount = count ?? sortedItems.length;
    const totalPages = computeTotalPages(totalCount, params.pageSize);
    const page = normalizePage(params.page, totalPages);
    const pageFrom = (page - 1) * params.pageSize;
    const items = sortedItems.slice(pageFrom, pageFrom + params.pageSize);

    logRecruitmentQuery({
      operation: "listRecruitmentCounties",
      filters: { ...params },
      page,
      page_size: params.pageSize,
      returned_row_count: items.length,
      total_count: totalCount,
      duration_ms: Math.round(performance.now() - startedAt),
      success: true,
    });

    return buildPaginatedResult(items, page, params.pageSize, totalCount);
  }

  const sortField = params.sort;
  let page = params.page;
  const initialResult = await buildQuery()
    .order(sortField, { ascending: params.direction === "asc", nullsFirst: false })
    .order("county", { ascending: true, nullsFirst: false })
    .range(from, to);
  let { data, count } = initialResult;
  const { error } = initialResult;

  if (error) {
    throw wrapDataAccessError("load recruitment counties", error);
  }

  const totalCount = count ?? 0;
  const totalPages = computeTotalPages(totalCount, params.pageSize);
  page = normalizePage(params.page, totalPages);

  if (page !== params.page && totalCount > 0) {
    const correctedFrom = (page - 1) * params.pageSize;
    const correctedTo = correctedFrom + params.pageSize - 1;
    const corrected = await buildQuery()
      .order(sortField, { ascending: params.direction === "asc", nullsFirst: false })
      .order("county", { ascending: true, nullsFirst: false })
      .range(correctedFrom, correctedTo);

    if (corrected.error) {
      throw wrapDataAccessError("load recruitment counties", corrected.error);
    }

    data = corrected.data;
    count = corrected.count;
  }

  const items = (data ?? []).map(mapCountyMetrics);

  logRecruitmentQuery({
    operation: "listRecruitmentCounties",
    filters: { ...params },
    page,
    page_size: params.pageSize,
    returned_row_count: items.length,
    total_count: totalCount,
    duration_ms: Math.round(performance.now() - startedAt),
    success: true,
  });

  return buildPaginatedResult(items, page, params.pageSize, totalCount);
}

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

export const getRecruitmentCountiesPaginated = cache(async function getRecruitmentCountiesPaginated(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PaginatedResult<CountyMetricsDto>> {
  return timedOperation(
    "getRecruitmentCountiesPaginated",
    async () => {
      const params = parseRecruitmentSearchParams(searchParams);
      return listRecruitmentCounties(params, { paginate: true });
    },
    { rowCount: (result) => result.items.length, cache: "miss" },
  );
});

export const getRecruitmentCountiesForExport = cache(async function getRecruitmentCountiesForExport(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<CountyMetricsDto[]> {
  return timedOperation(
    "getRecruitmentCountiesForExport",
    async () => {
      const params = parseRecruitmentSearchParams(searchParams);
      const result = await listRecruitmentCounties(params, { paginate: false });
      return result.items;
    },
    { rowCount: (counties) => counties.length, cache: "miss" },
  );
});

export async function getRecruitmentCounties(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<CountyMetricsDto[]> {
  return getRecruitmentCountiesForExport(searchParams);
}

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
        getRecruitmentCountiesForExport(searchParams),
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
