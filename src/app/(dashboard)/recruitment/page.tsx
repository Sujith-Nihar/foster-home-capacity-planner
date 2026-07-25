import { RecruitmentPageContent } from "@/components/recruitment/recruitment-page-content";
import { getCachedFilterOptions, getCachedRecruitmentCountyRanking } from "@/lib/data/cached-snapshot";
import { parseRecruitmentSearchParams } from "@/lib/validation/search-params";
import { setPerformanceRoute } from "@/lib/performance/timing";

export const dynamic = "force-dynamic";

type RecruitmentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RecruitmentPage({ searchParams }: RecruitmentPageProps) {
  setPerformanceRoute("/recruitment");
  const resolvedSearchParams = await searchParams;
  const [filterOptions, ranking] = await Promise.all([
    getCachedFilterOptions(),
    getCachedRecruitmentCountyRanking(102),
  ]);
  const highPriorityCount = ranking.filter(
    (county) => county.recruitmentPriority === "High",
  ).length;

  return (
    <RecruitmentPageContent
      filterOptions={filterOptions}
      searchParams={parseRecruitmentSearchParams(resolvedSearchParams)}
      rawSearchParams={resolvedSearchParams}
      highPriorityCount={highPriorityCount}
    />
  );
}
