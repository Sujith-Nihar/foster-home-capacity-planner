import { OperationalResultCount } from "@/components/operational/operational-result-count";
import { RecruitmentCountyTableBody } from "@/components/recruitment/recruitment-county-table-body";
import type { CountyAgeMetricsByCounty } from "@/lib/data/recruitment";
import { getRecruitmentCounties } from "@/lib/data/recruitment";
import { partitionRecruitmentCounties } from "@/lib/recruitment/analytics";
import { groupCountyAgeMetricsByCounty } from "@/lib/recruitment/age-groups";
import { getCachedCountyAgeMetrics } from "@/lib/data/cached-snapshot";
import { parseRecruitmentSearchParams } from "@/lib/validation/search-params";

type RecruitmentEligibleResultsProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function toCountyAgeMetricsRecord(
  countyAgeMetricsByCounty: CountyAgeMetricsByCounty,
): Record<string, import("@/lib/types/domain").CountyAgeMetricsDto[]> {
  return Object.fromEntries(countyAgeMetricsByCounty.entries());
}

export async function RecruitmentEligibleResults({
  searchParams,
}: RecruitmentEligibleResultsProps) {
  const params = parseRecruitmentSearchParams(searchParams);
  const [counties, allCountyAgeMetrics] = await Promise.all([
    getRecruitmentCounties(searchParams),
    getCachedCountyAgeMetrics(),
  ]);
  const { eligible } = partitionRecruitmentCounties(counties);
  const countyAgeMetricsByCounty = groupCountyAgeMetricsByCounty(allCountyAgeMetrics);
  const countyAgeMetricsRecord = toCountyAgeMetricsRecord(countyAgeMetricsByCounty);

  if (eligible.length === 0) {
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
        <OperationalResultCount totalCount={eligible.length} noun="county" nounPlural="counties" />
      </div>
      <RecruitmentCountyTableBody
        counties={eligible}
        countyAgeMetricsByCounty={countyAgeMetricsRecord}
        searchParams={params}
      />
    </div>
  );
}

export async function RecruitmentLimitedResults({
  searchParams,
}: RecruitmentEligibleResultsProps) {
  const params = parseRecruitmentSearchParams(searchParams);
  const [counties, allCountyAgeMetrics] = await Promise.all([
    getRecruitmentCounties(searchParams),
    getCachedCountyAgeMetrics(),
  ]);
  const { limitedData } = partitionRecruitmentCounties(counties);
  const countyAgeMetricsByCounty = groupCountyAgeMetricsByCounty(allCountyAgeMetrics);
  const countyAgeMetricsRecord = toCountyAgeMetricsRecord(countyAgeMetricsByCounty);

  if (limitedData.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-text-secondary" role="status">
        No limited-data counties match the selected filters.
      </p>
    );
  }

  return (
    <RecruitmentCountyTableBody
      counties={limitedData}
      countyAgeMetricsByCounty={countyAgeMetricsRecord}
      searchParams={params}
    />
  );
}
