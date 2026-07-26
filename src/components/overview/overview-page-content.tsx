import Link from "next/link";

import { MethodologyLink } from "@/components/methodology-link";
import { AttentionPanel } from "@/components/overview/attention-panel";
import { OverviewAdditionalAnalysis } from "@/components/overview/overview-additional-analysis";
import { OverviewMetricsGrid } from "@/components/overview/overview-metrics-grid";
import { OverviewPlanningNote } from "@/components/overview/overview-planning-note";
import { OverviewRecruitmentPressureChart } from "@/components/overview/overview-recruitment-pressure-chart";
import { OverviewUpcomingLicensesChart } from "@/components/overview/overview-upcoming-licenses-chart";
import { RecruitmentCountiesSection } from "@/components/overview/recruitment-counties-section";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { SectionReveal } from "@/components/ui/section-reveal";
import { SectionHeading, SectionShell } from "@/components/ui/section-shell";
import { SectionWave } from "@/components/ui/section-wave";
import type {
  CountyMetricsDto,
  MonthlyMetricsDto,
  RetentionPriorityDistributionDto,
  RetentionSummaryDto,
  SystemSnapshotDto,
} from "@/lib/types/domain";

type OverviewPageContentProps = {
  snapshot: SystemSnapshotDto;
  retentionSummary: RetentionSummaryDto;
  topRecruitmentCounties: CountyMetricsDto[];
  recruitmentPressureCounties: CountyMetricsDto[];
  monthlyMetrics: MonthlyMetricsDto[];
  retentionDistribution: RetentionPriorityDistributionDto;
  largestCounties: CountyMetricsDto[];
  showHistoricalLicenseChart: boolean;
};

export function OverviewPageContent({
  snapshot,
  retentionSummary,
  topRecruitmentCounties,
  recruitmentPressureCounties,
  monthlyMetrics,
  retentionDistribution,
  largestCounties,
  showHistoricalLicenseChart,
}: OverviewPageContentProps) {
  return (
    <div className="overview-page space-y-0">
      <PageIntroduction
        variant="hero"
        className="overview-page__hero"
        eyebrow="ILLINOIS CAPACITY OVERVIEW"
        headline="Translate foster-home data into clear action."
        highlightPhrase="clear action"
        description="Understand recruitment planning signals, recent provider placement activity and upcoming license exposure across Illinois."
        actions={[
          { label: "Review recruitment", href: "/recruitment" },
          { label: "Review retention", href: "/retention" },
        ]}
      />

      <SectionWave fill="mist" />
      <div className="bg-surface-raised pb-8 pt-3">
        <div className="content-container">
          <OverviewMetricsGrid snapshot={snapshot} />
        </div>
      </div>

      <SectionWave fill="navy" />
      <AttentionPanel
        snapshot={snapshot}
        retentionSummary={retentionSummary}
        retentionDistribution={retentionDistribution}
      />
      <SectionWave fill="paper" flip />

      <div className="space-y-8 pt-8">
        <SectionReveal>
          <SectionShell>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                titleId="recruitment-pressure-heading"
                eyebrow="Recruitment planning"
                title="Top counties for recruitment review"
                description="Top five eligible counties ranked by suggested recruitment attention, then children per engaged provider."
                className="mb-0"
              />
              <Link
                href="/recruitment"
                className="inline-flex min-h-11 items-center text-sm font-medium text-brand-navy underline-offset-4 hover:underline"
              >
                View all counties
              </Link>
            </div>
            <RecruitmentCountiesSection counties={topRecruitmentCounties} />
          </SectionShell>
        </SectionReveal>

        <SectionReveal>
          <SectionShell tone="raised">
            <SectionHeading
              eyebrow="Statewide analytics"
              title="Primary statewide signals"
              description="Charts that highlight upcoming license exposure and county recruitment pressure."
              className="mb-5"
            />
            <div className="grid gap-5 lg:grid-cols-2">
              <OverviewUpcomingLicensesChart
                monthlyMetrics={monthlyMetrics}
                retentionSummary={retentionSummary}
              />
              <OverviewRecruitmentPressureChart counties={recruitmentPressureCounties} />
            </div>
          </SectionShell>
        </SectionReveal>

        <OverviewAdditionalAnalysis
          snapshot={snapshot}
          monthlyMetrics={monthlyMetrics}
          retentionDistribution={retentionDistribution}
          largestCounties={largestCounties}
          showHistoricalLicenseChart={showHistoricalLicenseChart}
        />

        <SectionShell className="space-y-4 border-t border-border-subtle pt-8">
          <OverviewPlanningNote />
          <div className="flex justify-end">
            <MethodologyLink />
          </div>
        </SectionShell>
      </div>
    </div>
  );
}
