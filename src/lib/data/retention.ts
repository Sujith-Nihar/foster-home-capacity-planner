import {
  getActiveReportingDate,
  getServerSupabaseClient,
  mapProviderMetrics,
} from "@/lib/supabase/server";
import { wrapDataAccessError } from "@/lib/supabase/errors";
import { getFilterOptions } from "@/lib/data/recruitment";
import { sortRetentionProviders } from "@/lib/retention/query";
import type {
  PaginatedResult,
  ProviderMetricsDto,
  RetentionPriorityDistributionDto,
  RetentionSummaryDto,
} from "@/lib/types/domain";
import {
  parseCountyProvidersSearchParams,
  parseRetentionSearchParams,
  type RetentionFilterParams,
} from "@/lib/validation/search-params";

const RETENTION_LIST_COLUMNS =
  "provider_id, county, reporting_date, license_start_date, license_end_date, days_until_expiration, currently_has_placement, last_completed_placement_end, days_since_last_placement, total_active_days, active_days_last_365, eligible_licensed_days_last_365, engagement_rate_last_365, min_age, max_age, outreach_priority, outreach_reasons";

function applyRetentionFilters<
  T extends {
    eq: (column: string, value: string | number | boolean) => T;
    gte: (column: string, value: number) => T;
    lte: (column: string, value: number) => T;
  },
>(builder: T, params: RetentionFilterParams, reportingDate: string, county?: string): T {
  let query = builder.eq("reporting_date", reportingDate);

  if (county) {
    query = query.eq("county", county);
  } else if (params.county) {
    query = query.eq("county", params.county);
  }

  if (params.priority) {
    query = query.eq("outreach_priority", params.priority);
  }

  if (params.activity === "active") {
    query = query.eq("currently_has_placement", true);
  }

  if (params.activity === "inactive") {
    query = query.eq("currently_has_placement", false);
  }

  if (params.expiration === "within_30") {
    query = query.lte("days_until_expiration", 30);
  }

  if (params.expiration === "within_60") {
    query = query.lte("days_until_expiration", 60);
  }

  if (params.expiration === "within_90") {
    query = query.lte("days_until_expiration", 90);
  }

  if (params.expiration === "within_180") {
    query = query.lte("days_until_expiration", 180);
  }

  if (params.minInactivityDays !== undefined) {
    query = query.gte("days_since_last_placement", params.minInactivityDays);
  }

  if (params.maxInactivityDays !== undefined) {
    query = query.lte("days_since_last_placement", params.maxInactivityDays);
  }

  if (params.minEngagement !== undefined) {
    query = query.gte("engagement_rate_last_365", params.minEngagement);
  }

  if (params.maxEngagement !== undefined) {
    query = query.lte("engagement_rate_last_365", params.maxEngagement);
  }

  if (params.minAge !== undefined) {
    query = query.gte("max_age", params.minAge);
  }

  if (params.maxAge !== undefined) {
    query = query.lte("min_age", params.maxAge);
  }

  if (params.providerId !== undefined) {
    query = query.eq("provider_id", params.providerId);
  }

  return query;
}

async function countRetentionProviders(
  reportingDate: string,
  filters?: {
    currentlyHasPlacement?: boolean;
    maxDaysUntilExpiration?: number;
    outreachPriority?: "High" | "Medium" | "Low";
  },
): Promise<number> {
  const supabase = getServerSupabaseClient();
  let query = supabase
    .from("provider_metrics")
    .select("provider_id", { count: "exact", head: true })
    .eq("reporting_date", reportingDate);

  if (filters?.currentlyHasPlacement !== undefined) {
    query = query.eq("currently_has_placement", filters.currentlyHasPlacement);
  }

  if (filters?.maxDaysUntilExpiration !== undefined) {
    query = query.lte("days_until_expiration", filters.maxDaysUntilExpiration);
  }

  if (filters?.outreachPriority) {
    query = query.eq("outreach_priority", filters.outreachPriority);
  }

  const { count, error } = await query;

  if (error) {
    throw wrapDataAccessError("count retention providers", error);
  }

  return count ?? 0;
}

export async function getRetentionSummaryMetrics(
  reportingDate?: string,
): Promise<RetentionSummaryDto> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const [currentlyLicensedProviders, currentlyActiveProviders, licensesExpiringWithin90Days, highOutreachPriorityProviders] =
    await Promise.all([
      countRetentionProviders(activeReportingDate),
      countRetentionProviders(activeReportingDate, { currentlyHasPlacement: true }),
      countRetentionProviders(activeReportingDate, { maxDaysUntilExpiration: 90 }),
      countRetentionProviders(activeReportingDate, { outreachPriority: "High" }),
    ]);

  return {
    currentlyLicensedProviders,
    currentlyActiveProviders,
    inactiveProviders: currentlyLicensedProviders - currentlyActiveProviders,
    licensesExpiringWithin90Days,
    highOutreachPriorityProviders,
  };
}

export async function getRetentionProviders(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PaginatedResult<ProviderMetricsDto>> {
  const params = parseRetentionSearchParams(searchParams);
  const reportingDate = await getActiveReportingDate();
  const supabase = getServerSupabaseClient();
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  const baseQuery = applyRetentionFilters(
    supabase.from("provider_metrics").select(RETENTION_LIST_COLUMNS, { count: "exact" }),
    params,
    reportingDate,
  );

  if (params.sort === "outreach_priority") {
    const { data, error, count } = await baseQuery;

    if (error) {
      throw wrapDataAccessError("load retention providers", error);
    }

    const sortedItems = sortRetentionProviders(
      (data ?? []).map(mapProviderMetrics),
      params.sort,
      params.direction,
    );
    const totalCount = count ?? sortedItems.length;
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / params.pageSize);

    return {
      items: sortedItems.slice(from, to + 1),
      page: params.page,
      pageSize: params.pageSize,
      totalCount,
      totalPages,
    };
  }

  const { data, error, count } = await baseQuery
    .order(params.sort, { ascending: params.direction === "asc", nullsFirst: false })
    .range(from, to);

  if (error) {
    throw wrapDataAccessError("load retention providers", error);
  }

  const totalCount = count ?? 0;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / params.pageSize);

  return {
    items: (data ?? []).map(mapProviderMetrics),
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages,
  };
}

export async function getRetentionProvidersForCounty(
  county: string,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PaginatedResult<ProviderMetricsDto>> {
  const params = parseCountyProvidersSearchParams(searchParams);
  const reportingDate = await getActiveReportingDate();
  const supabase = getServerSupabaseClient();
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  const baseQuery = applyRetentionFilters(
    supabase.from("provider_metrics").select(RETENTION_LIST_COLUMNS, { count: "exact" }),
    params,
    reportingDate,
    county,
  );

  if (params.sort === "outreach_priority") {
    const { data, error, count } = await baseQuery;

    if (error) {
      throw wrapDataAccessError("load retention providers", error);
    }

    const sortedItems = sortRetentionProviders(
      (data ?? []).map(mapProviderMetrics),
      params.sort,
      params.direction,
    );
    const totalCount = count ?? sortedItems.length;

    return {
      items: sortedItems.slice(from, to + 1),
      page: params.page,
      pageSize: params.pageSize,
      totalCount,
      totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / params.pageSize),
    };
  }

  const { data, error, count } = await baseQuery
    .order(params.sort, { ascending: params.direction === "asc", nullsFirst: false })
    .range(from, to);

  if (error) {
    throw wrapDataAccessError("load retention providers", error);
  }

  const totalCount = count ?? 0;

  return {
    items: (data ?? []).map(mapProviderMetrics),
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / params.pageSize),
  };
}

async function countByOutreachPriority(
  priority: "High" | "Medium" | "Low",
  reportingDate: string,
): Promise<number> {
  return countRetentionProviders(reportingDate, { outreachPriority: priority });
}

export async function getRetentionPriorityDistribution(
  reportingDate?: string,
): Promise<RetentionPriorityDistributionDto> {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const [high, medium, low] = await Promise.all([
    countByOutreachPriority("High", activeReportingDate),
    countByOutreachPriority("Medium", activeReportingDate),
    countByOutreachPriority("Low", activeReportingDate),
  ]);

  return { high, medium, low };
}

export async function getRetentionPageData(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const [providers, filterOptions, summary] = await Promise.all([
    getRetentionProviders(searchParams),
    getFilterOptions(),
    getRetentionSummaryMetrics(),
  ]);

  return {
    providers,
    filterOptions,
    summary,
    searchParams: parseRetentionSearchParams(searchParams),
  };
}
