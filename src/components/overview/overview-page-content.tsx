import { LargestCountiesChart } from "@/components/charts/largest-counties-chart";
import { LicenseExpirationsChart } from "@/components/charts/license-expirations-chart";
import { PlacementTypeChart } from "@/components/charts/placement-type-chart";
import { RetentionDistributionChart } from "@/components/charts/retention-distribution-chart";
import { MethodologyLink } from "@/components/methodology-link";
import { AttentionPanel } from "@/components/overview/attention-panel";
import { OverviewMetricsGrid } from "@/components/overview/overview-metrics-grid";
import { RecruitmentCountiesSection } from "@/components/overview/recruitment-counties-section";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { SectionReveal } from "@/components/ui/section-reveal";
import { SectionHeading, SectionShell } from "@/components/ui/section-shell";
import { SectionWave } from "@/components/ui/section-wave";
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
    <div className="space-y-0">
      <PageIntroduction
        variant="hero"
        eyebrow="STATEWIDE CAPACITY OVERVIEW"
        headline="Translate foster-home data into clear action."
        highlightPhrase="clear action"
        description="Understand recruitment pressure, provider engagement and upcoming license exposure across Illinois."
        actions={[
          { label: "Review recruitment", href: "/recruitment" },
          { label: "Review retention", href: "/retention" },
        ]}
      />

      <SectionWave fill="mist" />
      <div className="bg-surface-raised pb-8 pt-2">
        <OverviewMetricsGrid snapshot={snapshot} />
      </div>

      <SectionWave fill="navy" />
      <AttentionPanel
        insights={insights}
        snapshot={snapshot}
        retentionSummary={retentionSummary}
        retentionDistribution={retentionDistribution}
      />
      <SectionWave fill="paper" flip />

      <div className="space-y-8 pt-8">
        <SectionReveal>
          <SectionShell>
            <SectionHeading
              titleId="recruitment-pressure-heading"
              eyebrow="Recruitment pressure"
              title="Top recruitment-pressure counties"
              description="Counties ranked by children per active provider, excluding limited-data counties."
            />
            <RecruitmentCountiesSection counties={topRecruitmentCounties} />
          </SectionShell>
        </SectionReveal>

        <SectionReveal>
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
        </SectionReveal>

        <SectionShell className="flex flex-col gap-3 border-t border-border-subtle pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-text-secondary">
            Metrics reflect the fixed reporting date and rule-based decision-support methodology. They
            support staff review and do not predict placement outcomes.
          </p>
          <MethodologyLink />
        </SectionShell>
      </div>
    </div>
  );
}
