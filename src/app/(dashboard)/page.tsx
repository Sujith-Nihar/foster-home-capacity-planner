import { OverviewPageContent } from "@/components/overview/overview-page-content";
import { getOverviewPageData } from "@/lib/data/overview";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getOverviewPageData();

  return (
    <OverviewPageContent
      snapshot={data.snapshot}
      insights={data.insights}
      retentionSummary={data.retentionSummary}
      topRecruitmentCounties={data.topRecruitmentCounties}
      monthlyMetrics={data.monthlyMetrics}
      retentionDistribution={data.retentionDistribution}
      largestCounties={data.largestCounties}
    />
  );
}
