import {
  executeSupabaseQuery,
  getActiveReportingDate,
  getServerSupabaseClient,
  mapCountyAgeMetrics,
  mapCountyMetrics,
  type Database,
} from "@/lib/supabase/server";
import { DataAccessError } from "@/lib/supabase/errors";
import type { CountyDetailDto } from "@/lib/types/domain";
import { getRetentionProvidersForCounty } from "@/lib/data/retention";

const COUNTY_DETAIL_COLUMNS =
  "county, reporting_date, current_children_in_care, current_foster_home_children, current_kin_children, current_nonfamily_children, licensed_providers, active_providers, inactive_providers, children_per_active_provider, out_of_county_foster_count, out_of_county_foster_rate, expiring_90_days, expiring_180_days, high_retention_providers, medium_retention_providers, highest_pressure_age_group, recruitment_priority, recruitment_reasons";

const COUNTY_AGE_COLUMNS =
  "county, age_group, reporting_date, current_foster_home_children, matching_licensed_providers, matching_active_providers, children_per_matching_active_provider";

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

export async function getCountyDetail(
  county: string,
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<CountyDetailDto> {
  const decodedCounty = decodeURIComponent(county);

  try {
    const [countyMetrics, ageGroups, retentionProviders] = await Promise.all([
      getCountyMetricsByName(decodedCounty),
      getCountyAgeMetrics(decodedCounty),
      getRetentionProvidersForCounty(decodedCounty, searchParams),
    ]);

    return {
      county: countyMetrics,
      ageGroups,
      retentionProviders: retentionProviders.items,
    };
  } catch (error) {
    if (error instanceof DataAccessError && error.code === "NOT_FOUND") {
      throw new DataAccessError(`County not found: ${decodedCounty}`, {
        code: "NOT_FOUND",
        cause: error,
      });
    }
    throw error;
  }
}
