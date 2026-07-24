import { RecruitmentPageContent } from "@/components/recruitment/recruitment-page-content";
import { getRecruitmentPageData } from "@/lib/data/recruitment";
import { setPerformanceRoute } from "@/lib/performance/timing";

export const dynamic = "force-dynamic";

type RecruitmentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RecruitmentPage({ searchParams }: RecruitmentPageProps) {
  setPerformanceRoute("/recruitment");
  const resolvedSearchParams = await searchParams;
  const data = await getRecruitmentPageData(resolvedSearchParams);

  return (
    <RecruitmentPageContent
      eligibleCounties={data.eligibleCounties}
      limitedDataCounties={data.limitedDataCounties}
      filterOptions={data.filterOptions}
      ageGroupPressure={data.ageGroupPressure}
      countyAgeMetricsByCounty={data.countyAgeMetricsByCounty}
      searchParams={data.searchParams}
    />
  );
}
