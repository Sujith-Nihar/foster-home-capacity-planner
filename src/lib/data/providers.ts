import {
  executeSupabaseQuery,
  getActiveReportingDate,
  getServerSupabaseClient,
  mapProviderActivityPeriod,
  mapProviderMetrics,
  type Database,
} from "@/lib/supabase/server";
import { DataAccessError } from "@/lib/supabase/errors";
import type { ProviderPageData } from "@/lib/types/domain";
import { buildProviderReviewSummary } from "@/lib/providers/detail";
import {
  buildProviderPreferenceContext,
  formatCurrentPreferenceLabel,
} from "@/lib/providers/preference-context";
import { parseProviderRouteId } from "@/lib/navigation/providers";
import type { ProviderDetailDto } from "@/lib/types/domain";
import { getCountyMetricsByName } from "@/lib/data/counties";
import type { MeasurableAgeGroupLabel } from "@/lib/recruitment/age-groups";

const PROVIDER_DETAIL_COLUMNS =
  "provider_id, county, reporting_date, license_start_date, license_end_date, days_until_expiration, currently_has_placement, last_completed_placement_end, days_since_last_placement, total_active_days, active_days_last_365, eligible_licensed_days_last_365, engagement_rate_last_365, min_age, max_age, outreach_priority, outreach_reasons";

const PROVIDER_ACTIVITY_COLUMNS =
  "provider_id, period_start, period_end, active_days, is_current";

export async function getProviderMetricsById(
  providerId: number,
  reportingDate?: string,
) {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const supabase = getServerSupabaseClient();
  const row = await executeSupabaseQuery<Database["public"]["Tables"]["provider_metrics"]["Row"]>(
    `load provider metrics for ${providerId}`,
    async () =>
      supabase
        .from("provider_metrics")
        .select(PROVIDER_DETAIL_COLUMNS)
        .eq("reporting_date", activeReportingDate)
        .eq("provider_id", providerId)
        .maybeSingle(),
  );

  return mapProviderMetrics(row);
}

export async function getProviderActivityPeriods(providerId: number) {
  const supabase = getServerSupabaseClient();
  const rows = await executeSupabaseQuery(`load provider activity for ${providerId}`, async () =>
    supabase
      .from("provider_activity_periods")
      .select(PROVIDER_ACTIVITY_COLUMNS)
      .eq("provider_id", providerId)
      .order("period_start", { ascending: true }),
  );

  return rows.map(mapProviderActivityPeriod);
}

export async function getProviderDetail(providerId: number): Promise<ProviderDetailDto> {
  if (!Number.isFinite(providerId) || providerId <= 0) {
    throw new DataAccessError("Invalid provider id.", { code: "VALIDATION_ERROR" });
  }

  try {
    const [provider, activityPeriods] = await Promise.all([
      getProviderMetricsById(providerId),
      getProviderActivityPeriods(providerId),
    ]);

    return {
      provider,
      activityPeriods,
    };
  } catch (error) {
    if (error instanceof DataAccessError && error.code === "NOT_FOUND") {
      throw new DataAccessError(`Provider not found: ${providerId}`, {
        code: "NOT_FOUND",
        cause: error,
      });
    }
    throw error;
  }
}

export async function getProviderPageData(
  providerIdParam: string,
): Promise<ProviderPageData | null> {
  const providerId = parseProviderRouteId(providerIdParam);

  if (providerId === null) {
    return null;
  }

  try {
    const detail = await getProviderDetail(providerId);
    const countyMetrics = await getCountyMetricsByName(detail.provider.county);
    const highestPressureAgeGroup =
      (countyMetrics.highestPressureAgeGroup as MeasurableAgeGroupLabel | null) ?? null;

    return {
      ...detail,
      reviewSummary: buildProviderReviewSummary(detail.provider),
      currentPreferenceLabel: formatCurrentPreferenceLabel(
        detail.provider.minAge,
        detail.provider.maxAge,
      ),
      preferenceContext: buildProviderPreferenceContext(
        detail.provider,
        highestPressureAgeGroup,
      ),
    };
  } catch (error) {
    if (error instanceof DataAccessError && error.code === "NOT_FOUND") {
      return null;
    }
    throw error;
  }
}
