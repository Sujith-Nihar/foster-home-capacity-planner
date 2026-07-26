import { RecruitmentCountyTableBody } from "@/components/recruitment/recruitment-county-table-body";
import { RecruitmentPagination } from "@/components/recruitment/recruitment-pagination";
import { RecruitmentResultCount } from "@/components/recruitment/recruitment-result-count";
import type { CountyAgeMetricsByCounty } from "@/lib/data/recruitment";
import { getRecruitmentCountiesPaginated } from "@/lib/data/recruitment";
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
  const [pagination, allCountyAgeMetrics] = await Promise.all([
    getRecruitmentCountiesPaginated(searchParams),
    getCachedCountyAgeMetrics(),
  ]);
  const countyAgeMetricsByCounty = groupCountyAgeMetricsByCounty(allCountyAgeMetrics);
  const countyAgeMetricsRecord = toCountyAgeMetricsRecord(countyAgeMetricsByCounty);

  if (pagination.totalCount === 0) {
    return (
      <div className="space-y-3 px-4 py-2" aria-busy="false">
        <RecruitmentResultCount totalCount={0} comparisonStatus={params.comparisonStatus} />
        <p className="px-0 py-4 text-sm text-text-secondary" role="status">
          No counties match the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" aria-busy="false">
      <div className="px-4 pt-2">
        <RecruitmentResultCount
          totalCount={pagination.totalCount}
          comparisonStatus={params.comparisonStatus}
        />
      </div>
      <RecruitmentCountyTableBody
        counties={pagination.items}
        countyAgeMetricsByCounty={countyAgeMetricsRecord}
        searchParams={params}
      />
      <RecruitmentPagination
        searchParams={params}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
      />
    </div>
  );
}

/** @deprecated Use RecruitmentCountyResults */
export const RecruitmentEligibleResults = RecruitmentCountyResults;

/** @deprecated Use RecruitmentCountyResults with comparisonStatus=limited */
export const RecruitmentLimitedResults = RecruitmentCountyResults;
