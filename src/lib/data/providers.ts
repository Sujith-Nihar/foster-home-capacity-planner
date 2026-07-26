import { unstable_cache } from "next/cache";

import { REPORTING_DATE } from "@/config/metrics";
import {
  executeSupabaseQuery,
  getActiveReportingDate,
  getServerSupabaseClient,
  mapProviderActivityPeriod,
  mapProviderMetrics,
  type Database,
} from "@/lib/supabase/server";
import { DataAccessError } from "@/lib/supabase/errors";
import type { ProviderDetailDto, ProviderPageData } from "@/lib/types/domain";
import { buildProviderReviewSummary } from "@/lib/providers/detail";
import { parseProviderRouteId } from "@/lib/navigation/providers";
import type { MeasurableAgeGroupLabel } from "@/lib/recruitment/age-groups";
import {
  buildCountyRecruitmentOverlapSentence,
  buildProviderPreferenceContext,
  formatPreferredAgeRangeLabel,
  providerHasAgeGroupOverlap,
} from "@/lib/providers/preference-context";
import { getCountyMetricsByName } from "@/lib/data/counties";
import { timedOperation } from "@/lib/performance/timing";
import { getCachedReportingDate } from "@/lib/data/cached-snapshot";

const PROVIDER_DETAIL_COLUMNS =
  "provider_id, county, reporting_date, license_start_date, license_end_date, days_until_expiration, currently_has_placement, last_completed_placement_end, days_since_last_placement, total_active_days, active_days_last_365, eligible_licensed_days_last_365, engagement_rate_last_365, min_age, max_age, outreach_priority, outreach_reasons";

const PROVIDER_ACTIVITY_COLUMNS =
  "provider_id, period_start, period_end, active_days, is_current";

async function loadProviderActivityPeriods(providerId: number) {
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

async function getCachedProviderActivityPeriods(providerId: number) {
  return unstable_cache(
    async () => loadProviderActivityPeriods(providerId),
    ["foster-provider-activity", REPORTING_DATE, String(providerId)],
    { revalidate: 60 * 60 * 24 * 365, tags: ["foster-snapshot"] },
  )();
}

export async function getProviderMetricsById(
  providerId: number,
  reportingDate?: string,
) {
  const activeReportingDate = reportingDate ?? (await getActiveReportingDate());
  const supabase = getServerSupabaseClient();
  return timedOperation(
    "provider metric lookup",
    async () => {
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
    },
    { cache: "miss" },
  );
}

export async function getProviderActivityPeriods(providerId: number) {
  if ((await getActiveReportingDate()) === (await getCachedReportingDate())) {
    return timedOperation(
      "provider activity timeline lookup",
      () => getCachedProviderActivityPeriods(providerId),
      {
        rowCount: (periods) => periods.length,
        cache: "hit",
      },
    );
  }

  return timedOperation(
    "provider activity timeline lookup",
    () => loadProviderActivityPeriods(providerId),
    {
      rowCount: (periods) => periods.length,
      cache: "miss",
    },
  );
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

  return timedOperation(
    "getProviderDetailPageData",
    async () => {
      try {
        const provider = await getProviderMetricsById(providerId);
        const [activityPeriods, countyMetrics] = await Promise.all([
          getProviderActivityPeriods(providerId),
          timedOperation(
            "provider county-context lookup",
            () => getCountyMetricsByName(provider.county),
            { cache: "hit" },
          ),
        ]);

        const highestPressureAgeGroup =
          (countyMetrics.highestPressureAgeGroup as MeasurableAgeGroupLabel | null) ?? null;
        const hasAgeGroupOverlap = providerHasAgeGroupOverlap(provider, highestPressureAgeGroup);

        return {
          provider,
          activityPeriods,
          reviewSummary: buildProviderReviewSummary(provider),
          preferredAgeRangeLabel: formatPreferredAgeRangeLabel(provider.minAge, provider.maxAge),
          ageGroupOverlapNote: buildProviderPreferenceContext(provider, highestPressureAgeGroup),
          countyRecruitmentOverlapSentence: buildCountyRecruitmentOverlapSentence(hasAgeGroupOverlap),
          highestPressureAgeGroup,
        };
      } catch (error) {
        if (error instanceof DataAccessError && error.code === "NOT_FOUND") {
          return null;
        }
        throw error;
      }
    },
    { cache: "n/a" },
  );
}
