import { LargestCountiesChart } from "@/components/charts/largest-counties-chart";
import { LicenseExpirationsChart } from "@/components/charts/license-expirations-chart";
import { PlacementTypeChart } from "@/components/charts/placement-type-chart";
import { RetentionDistributionChart } from "@/components/charts/retention-distribution-chart";
import { AttentionPanel } from "@/components/overview/attention-panel";
import { OverviewKpiGrid } from "@/components/overview/overview-kpi-grid";
import { RecruitmentCountiesSection } from "@/components/overview/recruitment-counties-section";
import type {
  CountyMetricsDto,
  MonthlyMetricsDto,
  OverviewInsightsDto,
  RetentionPriorityDistributionDto,
  SystemSnapshotDto,
} from "@/lib/types/domain";

type OverviewPageContentProps = {
  snapshot: SystemSnapshotDto;
  insights: OverviewInsightsDto;
  topRecruitmentCounties: CountyMetricsDto[];
  monthlyMetrics: MonthlyMetricsDto[];
  retentionDistribution: RetentionPriorityDistributionDto;
  largestCounties: CountyMetricsDto[];
};

export function OverviewPageContent({
  snapshot,
  insights,
  topRecruitmentCounties,
  monthlyMetrics,
  retentionDistribution,
  largestCounties,
}: OverviewPageContentProps) {
  return (
    <div className="space-y-8">
      <OverviewKpiGrid snapshot={snapshot} />
      <AttentionPanel insights={insights} />
      <RecruitmentCountiesSection counties={topRecruitmentCounties} />
      <div className="grid gap-6 lg:grid-cols-2">
        <LicenseExpirationsChart data={monthlyMetrics} />
        <RetentionDistributionChart data={retentionDistribution} />
        <PlacementTypeChart snapshot={snapshot} />
        <LargestCountiesChart counties={largestCounties} />
      </div>
    </div>
  );
}
