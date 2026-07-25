import { OperationalResultCount } from "@/components/operational/operational-result-count";
import { RecruitmentCountyTableBody } from "@/components/recruitment/recruitment-county-table-body";
import type { CountyAgeMetricsByCounty } from "@/lib/data/recruitment";
import { getRecruitmentCounties } from "@/lib/data/recruitment";
import { groupCountyAgeMetricsByCounty } from "@/lib/recruitment/age-groups";
import { getCachedCountyAgeMetrics } from "@/lib/data/cached-snapshot";
import { parseRecruitmentSearchParams } from "@/lib/validation/search-params";

type RecruitmentCountyResultsProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function toCountyAgeMetricsRecord(
  countyAgeMetricsByCounty: CountyAgeMetricsByCounty,
): Record<string, import("@/lib/types/domain").CountyAgeMetricsDto[]> {
  return Object.fromEntries(countyAgeMetricsByCounty.entries());
}

export async function RecruitmentCountyResults({ searchParams }: RecruitmentCountyResultsProps) {
  const params = parseRecruitmentSearchParams(searchParams);
  const [counties, allCountyAgeMetrics] = await Promise.all([
    getRecruitmentCounties(searchParams),
    getCachedCountyAgeMetrics(),
  ]);
  const countyAgeMetricsByCounty = groupCountyAgeMetricsByCounty(allCountyAgeMetrics);
  const countyAgeMetricsRecord = toCountyAgeMetricsRecord(countyAgeMetricsByCounty);

  if (counties.length === 0) {
    return (
      <div className="space-y-3 px-4 py-2">
        <OperationalResultCount totalCount={0} noun="county" nounPlural="counties" />
        <p className="px-0 py-4 text-sm text-text-secondary" role="status">
          No counties match the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="px-4 pt-2">
        <OperationalResultCount totalCount={counties.length} noun="county" nounPlural="counties" />
      </div>
      <RecruitmentCountyTableBody
        counties={counties}
        countyAgeMetricsByCounty={countyAgeMetricsRecord}
        searchParams={params}
      />
    </div>
  );
}

/** @deprecated Use RecruitmentCountyResults */
export const RecruitmentEligibleResults = RecruitmentCountyResults;

/** @deprecated Use RecruitmentCountyResults with comparisonStatus=limited */
export const RecruitmentLimitedResults = RecruitmentCountyResults;
