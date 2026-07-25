import { unstable_cache } from "next/cache";

import { REPORTING_DATE } from "@/config/metrics";
import type { AgeGroupLabel } from "@/config/metrics";
import {
  executeSupabaseQuery,
  getServerSupabaseClient,
  mapCountyAgeMetrics,
  mapCountyMetrics,
  mapDatasetMetadata,
  mapMonthlyMetrics,
  mapSystemSnapshot,
  type Database,
} from "@/lib/supabase/server";
import { wrapDataAccessError } from "@/lib/supabase/errors";
import { aggregateAgeGroupPressure } from "@/lib/recruitment/analytics";
import type {
  CountyAgeMetricsDto,
  CountyMetricsDto,
  DatasetMetadataDto,
  FilterOptionsDto,
  MonthlyMetricsDto,
  OutreachPriority,
  RecruitmentPriority,
  RetentionPriorityDistributionDto,
  RetentionSummaryDto,
  SystemSnapshotDto,
} from "@/lib/types/domain";

const SNAPSHOT_CACHE_TAG = "foster-snapshot";
const SNAPSHOT_REVALIDATE_SECONDS = 60 * 60 * 24 * 365;

const COUNTY_DETAIL_COLUMNS =
  "county, reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, licensed_providers, active_providers, inactive_providers, children_per_active_provider, out_of_county_foster_count, out_of_county_foster_rate, expiring_90_days, expiring_180_days, high_retention_providers, medium_retention_providers, highest_pressure_age_group, recruitment_priority, recruitment_reasons";

const COUNTY_LIST_COLUMNS = COUNTY_DETAIL_COLUMNS;

const COUNTY_AGE_COLUMNS =
  "county, age_group, reporting_date, current_foster_home_children, matching_licensed_providers, matching_active_providers, children_per_matching_active_provider";

async function loadSystemSnapshot(reportingDate: string): Promise<SystemSnapshotDto> {
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

  return mapSystemSnapshot(row);
}

async function loadMonthlyMetrics(limit: number): Promise<MonthlyMetricsDto[]> {
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

async function loadDatasetMetadata(): Promise<DatasetMetadataDto> {
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

async function loadRecruitmentCountyRanking(
  reportingDate: string,
  limit: number,
): Promise<CountyMetricsDto[]> {
  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery("load recruitment county ranking", async () =>
    supabase
      .from("county_metrics")
      .select(COUNTY_LIST_COLUMNS)
      .eq("reporting_date", reportingDate)
      .neq("recruitment_priority", "Limited data")
      .order("children_per_active_provider", { ascending: false, nullsFirst: false })
      .limit(limit),
  );

  return rows.map(mapCountyMetrics);
}

async function loadLargestCounties(
  reportingDate: string,
  limit: number,
): Promise<CountyMetricsDto[]> {
  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery("load largest counties by foster placements", async () =>
    supabase
      .from("county_metrics")
      .select(COUNTY_LIST_COLUMNS)
      .eq("reporting_date", reportingDate)
      .order("current_foster_home_children", { ascending: false })
      .limit(limit),
  );

  return rows.map(mapCountyMetrics);
}

async function loadCountyMetricsByName(
  county: string,
  reportingDate: string,
): Promise<CountyMetricsDto> {
  const supabase = getServerSupabaseClient();
  const row = await executeSupabaseQuery<Database["public"]["Tables"]["county_metrics"]["Row"]>(
    `load county metrics for ${county}`,
    async () =>
      supabase
        .from("county_metrics")
        .select(COUNTY_DETAIL_COLUMNS)
        .eq("reporting_date", reportingDate)
        .eq("county", county)
        .maybeSingle(),
  );

  return mapCountyMetrics(row);
}

async function loadFilterOptions(reportingDate: string): Promise<FilterOptionsDto> {
  const supabase = getServerSupabaseClient();
  const data = await executeSupabaseQuery<
    Database["public"]["Functions"]["get_application_filter_options"]["Returns"]
  >("load filter options", async () =>
    supabase.rpc("get_application_filter_options", {
      reporting_date_param: reportingDate,
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

async function loadRetentionSummaryMetrics(reportingDate: string): Promise<RetentionSummaryDto> {
  const [
    currentlyLicensedProviders,
    currentlyActiveProviders,
    licensesExpiringWithin90Days,
    highOutreachPriorityProviders,
  ] = await Promise.all([
    countRetentionProviders(reportingDate),
    countRetentionProviders(reportingDate, { currentlyHasPlacement: true }),
    countRetentionProviders(reportingDate, { maxDaysUntilExpiration: 90 }),
    countRetentionProviders(reportingDate, { outreachPriority: "High" }),
  ]);

  return {
    currentlyLicensedProviders,
    currentlyActiveProviders,
    inactiveProviders: currentlyLicensedProviders - currentlyActiveProviders,
    licensesExpiringWithin90Days,
    highOutreachPriorityProviders,
  };
}

async function loadRetentionPriorityDistribution(
  reportingDate: string,
): Promise<RetentionPriorityDistributionDto> {
  const [high, medium, low] = await Promise.all([
    countRetentionProviders(reportingDate, { outreachPriority: "High" }),
    countRetentionProviders(reportingDate, { outreachPriority: "Medium" }),
    countRetentionProviders(reportingDate, { outreachPriority: "Low" }),
  ]);

  return { high, medium, low };
}

export const getCachedReportingDate = unstable_cache(
  async () => REPORTING_DATE,
  ["foster-reporting-date"],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export const getCachedSystemSnapshot = unstable_cache(
  async () => loadSystemSnapshot(REPORTING_DATE),
  ["foster-system-snapshot", REPORTING_DATE],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export const getCachedMonthlyMetrics = unstable_cache(
  async (limit = 24) => loadMonthlyMetrics(limit),
  ["foster-monthly-metrics", REPORTING_DATE],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export const getCachedDatasetMetadata = unstable_cache(
  async () => loadDatasetMetadata(),
  ["foster-dataset-metadata", REPORTING_DATE],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export const getCachedCountyAgeMetrics = unstable_cache(
  async () => loadCountyAgeMetrics(REPORTING_DATE),
  ["foster-county-age-metrics", REPORTING_DATE],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export async function getCachedCountyMetricsByName(county: string): Promise<CountyMetricsDto> {
  return unstable_cache(
    async () => loadCountyMetricsByName(county, REPORTING_DATE),
    ["foster-county-metrics-by-name", REPORTING_DATE, county],
    { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
  )();
}

export const getCachedRecruitmentCountyRanking = unstable_cache(
  async (limit: number) => loadRecruitmentCountyRanking(REPORTING_DATE, limit),
  ["foster-recruitment-county-ranking", REPORTING_DATE],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export const getCachedLargestCounties = unstable_cache(
  async (limit: number) => loadLargestCounties(REPORTING_DATE, limit),
  ["foster-largest-counties", REPORTING_DATE],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export const getCachedFilterOptions = unstable_cache(
  async () => loadFilterOptions(REPORTING_DATE),
  ["foster-filter-options", REPORTING_DATE],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export const getCachedRetentionSummaryMetrics = unstable_cache(
  async () => loadRetentionSummaryMetrics(REPORTING_DATE),
  ["foster-retention-summary", REPORTING_DATE],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export const getCachedRetentionPriorityDistribution = unstable_cache(
  async () => loadRetentionPriorityDistribution(REPORTING_DATE),
  ["foster-retention-priority-distribution", REPORTING_DATE],
  { revalidate: SNAPSHOT_REVALIDATE_SECONDS, tags: [SNAPSHOT_CACHE_TAG] },
);

export function deriveAgeGroupPressureFromCountyAgeMetrics(
  countyAgeMetrics: CountyAgeMetricsDto[],
) {
  return aggregateAgeGroupPressure(
    countyAgeMetrics.map((row) => ({
      ageGroup: row.ageGroup,
      currentFosterHomeChildren: row.currentFosterHomeChildren,
      matchingActiveProviders: row.matchingActiveProviders,
      childrenPerMatchingActiveProvider: row.childrenPerMatchingActiveProvider,
    })),
  );
}

export type CachedRetentionSummary = RetentionSummaryDto;
export type CachedRetentionPriorityDistribution = RetentionPriorityDistributionDto;
export type CachedFilterOptions = FilterOptionsDto;
