import {
  executeSupabaseQuery,
  getActiveReportingDate,
  getServerSupabaseClient,
  mapProviderActivityPeriod,
  mapProviderMetrics,
  type Database,
} from "@/lib/supabase/server";
import { DataAccessError } from "@/lib/supabase/errors";
import type { ProviderDetailDto } from "@/lib/types/domain";
import { formatAgePreferenceRange, formatBooleanLabel, formatDays, formatNullablePercent } from "@/lib/utils/formatters";

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

export function buildProviderReviewSummary(provider: ProviderDetailDto["provider"]): string {
  const placementStatus = formatBooleanLabel(
    provider.currentlyHasPlacement,
    "currently has a foster-home placement",
    "does not currently have a foster-home placement",
  );

  return [
    `Provider ${provider.providerId} in ${provider.county} County ${placementStatus}.`,
    `License expires in ${formatDays(provider.daysUntilExpiration)} with age preferences of ${formatAgePreferenceRange(provider.minAge, provider.maxAge)}.`,
    `Recent engagement is ${formatNullablePercent(provider.engagementRateLast365)} over the last 365-day window.`,
    `Outreach priority reasons: ${provider.outreachReasons.join("; ") || "No elevated outreach signals at the reporting date."}`,
  ].join(" ");
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

export async function getProviderPageData(providerId: number) {
  const detail = await getProviderDetail(providerId);

  return {
    ...detail,
    reviewSummary: buildProviderReviewSummary(detail.provider),
  };
}
