import { LicenseExpirationsChart } from "@/components/charts/license-expirations-chart";
import { LargestCountiesChart } from "@/components/charts/largest-counties-chart";
import { PlacementTypeChart } from "@/components/charts/placement-type-chart";
import { RetentionDistributionChart } from "@/components/charts/retention-distribution-chart";
import { OverviewAdditionalAnalysisDisclosure } from "@/components/overview/overview-additional-analysis-disclosure";
import { SectionHeading, SectionShell } from "@/components/ui/section-shell";
import type {
  CountyMetricsDto,
  MonthlyMetricsDto,
  RetentionPriorityDistributionDto,
  SystemSnapshotDto,
} from "@/lib/types/domain";

type OverviewAdditionalAnalysisProps = {
  snapshot: SystemSnapshotDto;
  monthlyMetrics: MonthlyMetricsDto[];
  retentionDistribution: RetentionPriorityDistributionDto;
  largestCounties: CountyMetricsDto[];
  showHistoricalLicenseChart: boolean;
};

export function OverviewAdditionalAnalysis({
  snapshot,
  monthlyMetrics,
  retentionDistribution,
  largestCounties,
  showHistoricalLicenseChart,
}: OverviewAdditionalAnalysisProps) {
  return (
    <SectionShell tone="raised">
      <OverviewAdditionalAnalysisDisclosure
        heading={
          <SectionHeading
            titleId="additional-analysis-heading"
            title="Additional statewide analysis"
            description="Optional charts with placement context, outreach distribution, and county comparisons."
            className="mb-0"
          />
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <RetentionDistributionChart data={retentionDistribution} />
          <PlacementTypeChart snapshot={snapshot} />
          <LargestCountiesChart counties={largestCounties} />
          {showHistoricalLicenseChart ? (
            <LicenseExpirationsChart data={monthlyMetrics} />
          ) : null}
        </div>
      </OverviewAdditionalAnalysisDisclosure>
    </SectionShell>
  );
}
