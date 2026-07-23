import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { AgeGroupLabel } from "@/config/metrics";
import { REPORTING_DATE } from "@/config/metrics";
import { DataAccessError } from "@/lib/supabase/errors";
import type {
  CountyAgeMetricsDto,
  CountyMetricsDto,
  DatasetMetadataDto,
  MonthlyMetricsDto,
  OutreachPriority,
  ProviderActivityPeriodDto,
  ProviderMetricsDto,
  RecruitmentPriority,
  SystemSnapshotDto,
} from "@/lib/types/domain";
import { parseReasonTags } from "@/lib/utils/formatters";

type TableDefinition<Row> = {
  Row: Row;
  Insert: Row;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      dataset_metadata: TableDefinition<{
        dataset_version: string;
        reporting_date: string;
        generated_at: string;
        provider_source_hash: string;
        child_source_hash: string;
        placement_source_hash: string;
        source_hash: string;
        etl_version: string;
        provider_count: number;
        child_count: number;
        placement_count: number;
      }>;
      system_snapshot: TableDefinition<{
        reporting_date: string;
        current_children_in_care: number;
        current_foster_home_children: number;
        current_kin_children: number;
        current_nonfamily_children: number;
        currently_licensed_providers: number;
        currently_active_providers: number;
        high_recruitment_counties: number;
        high_retention_providers: number;
      }>;
      county_metrics: TableDefinition<{
        county: string;
        reporting_date: string;
        current_children_in_care: number;
        current_foster_home_children: number;
        current_kin_children: number;
        current_nonfamily_children: number;
        licensed_providers: number;
        active_providers: number;
        inactive_providers: number;
        children_per_active_provider: number | null;
        out_of_county_foster_count: number;
        out_of_county_foster_rate: number | null;
        expiring_90_days: number;
        expiring_180_days: number;
        high_retention_providers: number;
        medium_retention_providers: number;
        highest_pressure_age_group: string | null;
        recruitment_priority: string;
        recruitment_reasons: string[];
      }>;
      county_age_metrics: TableDefinition<{
        county: string;
        age_group: string;
        reporting_date: string;
        current_foster_home_children: number;
        matching_licensed_providers: number;
        matching_active_providers: number;
        children_per_matching_active_provider: number | null;
      }>;
      provider_metrics: TableDefinition<{
        provider_id: number;
        county: string;
        reporting_date: string;
        license_start_date: string;
        license_end_date: string;
        days_until_expiration: number;
        currently_has_placement: boolean;
        last_completed_placement_end: string | null;
        days_since_last_placement: number | null;
        total_active_days: number;
        active_days_last_365: number;
        eligible_licensed_days_last_365: number;
        engagement_rate_last_365: number | null;
        min_age: number;
        max_age: number;
        outreach_priority: string;
        outreach_reasons: string[];
      }>;
      provider_activity_periods: TableDefinition<{
        provider_id: number;
        period_start: string;
        period_end: string;
        active_days: number;
        is_current: boolean;
      }>;
      monthly_metrics: TableDefinition<{
        month: string;
        new_license_starts: number;
        license_expirations: number;
        active_provider_count: number;
        foster_home_placement_starts: number;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      get_application_filter_options: {
        Args: {
          reporting_date_param?: string | null;
        };
        Returns: {
          reporting_date: string;
          counties: string[];
          recruitment_priorities: string[];
          outreach_priorities: string[];
          age_groups: string[];
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type AppSupabaseClient = SupabaseClient<Database>;

let cachedClient: AppSupabaseClient | null = null;

function getSupabaseConfig(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    throw new DataAccessError(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      { code: "CONFIG_ERROR" },
    );
  }

  return { url, publishableKey };
}

export function createServerSupabaseClient(): AppSupabaseClient {
  const { url, publishableKey } = getSupabaseConfig();

  return createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getServerSupabaseClient(): AppSupabaseClient {
  if (!cachedClient) {
    cachedClient = createServerSupabaseClient();
  }

  return cachedClient;
}

type CountyMetricsRow = Database["public"]["Tables"]["county_metrics"]["Row"];
type CountyAgeMetricsRow = Database["public"]["Tables"]["county_age_metrics"]["Row"];
type ProviderMetricsRow = Database["public"]["Tables"]["provider_metrics"]["Row"];
type ProviderActivityRow = Database["public"]["Tables"]["provider_activity_periods"]["Row"];
type SystemSnapshotRow = Database["public"]["Tables"]["system_snapshot"]["Row"];
type DatasetMetadataRow = Database["public"]["Tables"]["dataset_metadata"]["Row"];
type MonthlyMetricsRow = Database["public"]["Tables"]["monthly_metrics"]["Row"];

export async function executeSupabaseQuery<T>(
  description: string,
  operation: () => Promise<{ data: T | null; error: { message: string } | null }>,
  options: { allowNull?: boolean } = {},
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      throw new DataAccessError(`Failed to ${description}.`, { code: "QUERY_ERROR", cause: error });
    }
    if (data === null && !options.allowNull) {
      throw new DataAccessError(`No data returned while attempting to ${description}.`, {
        code: "NOT_FOUND",
      });
    }
    return data as T;
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(`Failed to ${description}.`, { code: "QUERY_ERROR", cause: error });
  }
}

export function mapDatasetMetadata(row: DatasetMetadataRow): DatasetMetadataDto {
  return {
    datasetVersion: row.dataset_version,
    reportingDate: row.reporting_date,
    generatedAt: row.generated_at,
    sourceHash: row.source_hash,
    etlVersion: row.etl_version,
    providerCount: row.provider_count,
    childCount: row.child_count,
    placementCount: row.placement_count,
  };
}

export function mapSystemSnapshot(row: SystemSnapshotRow): SystemSnapshotDto {
  return {
    reportingDate: row.reporting_date,
    currentChildrenInCare: row.current_children_in_care,
    currentFosterHomeChildren: row.current_foster_home_children,
    currentKinChildren: row.current_kin_children,
    currentNonfamilyChildren: row.current_nonfamily_children,
    currentlyLicensedProviders: row.currently_licensed_providers,
    currentlyActiveProviders: row.currently_active_providers,
    highRecruitmentCounties: row.high_recruitment_counties,
    highRetentionProviders: row.high_retention_providers,
  };
}

export function mapCountyMetrics(row: CountyMetricsRow): CountyMetricsDto {
  return {
    county: row.county,
    reportingDate: row.reporting_date,
    currentChildrenInCare: row.current_children_in_care,
    currentFosterHomeChildren: row.current_foster_home_children,
    currentKinChildren: row.current_kin_children,
    currentNonfamilyChildren: row.current_nonfamily_children,
    licensedProviders: row.licensed_providers,
    activeProviders: row.active_providers,
    inactiveProviders: row.inactive_providers,
    childrenPerActiveProvider: row.children_per_active_provider,
    outOfCountyFosterCount: row.out_of_county_foster_count,
    outOfCountyFosterRate: row.out_of_county_foster_rate,
    expiring90Days: row.expiring_90_days,
    expiring180Days: row.expiring_180_days,
    highRetentionProviders: row.high_retention_providers,
    mediumRetentionProviders: row.medium_retention_providers,
    highestPressureAgeGroup: row.highest_pressure_age_group as AgeGroupLabel | null,
    recruitmentPriority: row.recruitment_priority as RecruitmentPriority,
    recruitmentReasons: parseReasonTags(row.recruitment_reasons),
  };
}

export function mapCountyAgeMetrics(row: CountyAgeMetricsRow): CountyAgeMetricsDto {
  return {
    county: row.county,
    ageGroup: row.age_group as AgeGroupLabel,
    reportingDate: row.reporting_date,
    currentFosterHomeChildren: row.current_foster_home_children,
    matchingLicensedProviders: row.matching_licensed_providers,
    matchingActiveProviders: row.matching_active_providers,
    childrenPerMatchingActiveProvider: row.children_per_matching_active_provider,
  };
}

export function mapProviderMetrics(row: ProviderMetricsRow): ProviderMetricsDto {
  return {
    providerId: row.provider_id,
    county: row.county,
    reportingDate: row.reporting_date,
    licenseStartDate: row.license_start_date,
    licenseEndDate: row.license_end_date,
    daysUntilExpiration: row.days_until_expiration,
    currentlyHasPlacement: row.currently_has_placement,
    lastCompletedPlacementEnd: row.last_completed_placement_end,
    daysSinceLastPlacement: row.days_since_last_placement,
    totalActiveDays: row.total_active_days,
    activeDaysLast365: row.active_days_last_365,
    eligibleLicensedDaysLast365: row.eligible_licensed_days_last_365,
    engagementRateLast365: row.engagement_rate_last_365,
    minAge: row.min_age,
    maxAge: row.max_age,
    outreachPriority: row.outreach_priority as OutreachPriority,
    outreachReasons: parseReasonTags(row.outreach_reasons),
  };
}

export function mapProviderActivityPeriod(row: ProviderActivityRow): ProviderActivityPeriodDto {
  return {
    providerId: row.provider_id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    activeDays: row.active_days,
    isCurrent: row.is_current,
  };
}

export function mapMonthlyMetrics(row: MonthlyMetricsRow): MonthlyMetricsDto {
  return {
    month: row.month,
    newLicenseStarts: row.new_license_starts,
    licenseExpirations: row.license_expirations,
    activeProviderCount: row.active_provider_count,
    fosterHomePlacementStarts: row.foster_home_placement_starts,
  };
}

export async function getActiveReportingDate(): Promise<string> {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from("system_snapshot")
    .select("reporting_date")
    .order("reporting_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new DataAccessError("Failed to load active reporting date.", {
      code: "QUERY_ERROR",
      cause: error,
    });
  }

  return data?.reporting_date ?? REPORTING_DATE;
}
