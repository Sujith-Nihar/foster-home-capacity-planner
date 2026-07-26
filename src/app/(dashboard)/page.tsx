import { OverviewPageContent } from "@/components/overview/overview-page-content";
import { getOverviewPageData } from "@/lib/data/overview";
import { setPerformanceRoute } from "@/lib/performance/timing";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  setPerformanceRoute("/");
  const data = await getOverviewPageData();

  return (
    <OverviewPageContent
      snapshot={data.snapshot}
      retentionSummary={data.retentionSummary}
      topRecruitmentCounties={data.topRecruitmentCounties}
      recruitmentPressureCounties={data.recruitmentPressureCounties}
      monthlyMetrics={data.monthlyMetrics}
      retentionDistribution={data.retentionDistribution}
      largestCounties={data.largestCounties}
      showHistoricalLicenseChart={data.showHistoricalLicenseChart}
    />
  );
}
