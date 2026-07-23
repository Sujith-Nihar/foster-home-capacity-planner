import { LargestCountiesChart } from "@/components/charts/largest-counties-chart";
import { LicenseExpirationsChart } from "@/components/charts/license-expirations-chart";
import { PlacementTypeChart } from "@/components/charts/placement-type-chart";
import { RetentionDistributionChart } from "@/components/charts/retention-distribution-chart";
import { MethodologyLink } from "@/components/methodology-link";
import { AttentionPanel } from "@/components/overview/attention-panel";
import { OverviewBentoGrid } from "@/components/overview/overview-bento-grid";
import { OverviewHero } from "@/components/overview/overview-hero";
import { RecruitmentCountiesSection } from "@/components/overview/recruitment-counties-section";
import { SectionHeading, SectionShell } from "@/components/ui/section-shell";
import type {
  CountyMetricsDto,
  MonthlyMetricsDto,
  OverviewInsightsDto,
  RetentionPriorityDistributionDto,
  RetentionSummaryDto,
  SystemSnapshotDto,
} from "@/lib/types/domain";

type OverviewPageContentProps = {
  snapshot: SystemSnapshotDto;
  insights: OverviewInsightsDto;
  retentionSummary: RetentionSummaryDto;
  topRecruitmentCounties: CountyMetricsDto[];
  monthlyMetrics: MonthlyMetricsDto[];
  retentionDistribution: RetentionPriorityDistributionDto;
  largestCounties: CountyMetricsDto[];
};

export function OverviewPageContent({
  snapshot,
  insights,
  retentionSummary,
  topRecruitmentCounties,
  monthlyMetrics,
  retentionDistribution,
  largestCounties,
}: OverviewPageContentProps) {
  return (
    <div className="space-y-6">
      <OverviewHero snapshot={snapshot} />

      <SectionShell tone="tint">
        <OverviewBentoGrid snapshot={snapshot} />
      </SectionShell>

      <AttentionPanel
        insights={insights}
        snapshot={snapshot}
        retentionSummary={retentionSummary}
        retentionDistribution={retentionDistribution}
      />

      <SectionShell>
        <SectionHeading
          titleId="recruitment-pressure-heading"
          eyebrow="Recruitment pressure"
          title="Top recruitment-pressure counties"
          description="Counties ranked by children per active provider, excluding limited-data counties."
        />
        <RecruitmentCountiesSection counties={topRecruitmentCounties} />
      </SectionShell>

      <SectionShell tone="raised">
        <SectionHeading
          eyebrow="Provider retention outlook"
          title="Retention and placement analytics"
          description="License timing, outreach distribution, and placement context for statewide review."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <LicenseExpirationsChart data={monthlyMetrics} />
          <RetentionDistributionChart data={retentionDistribution} />
          <PlacementTypeChart snapshot={snapshot} />
          <LargestCountiesChart counties={largestCounties} />
        </div>
      </SectionShell>

      <SectionShell className="flex flex-col gap-3 border-t border-border-subtle pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-text-secondary">
          Metrics reflect the fixed reporting date and rule-based decision-support methodology. They
          support staff review and do not predict placement outcomes.
        </p>
        <MethodologyLink />
      </SectionShell>
    </div>
  );
}
