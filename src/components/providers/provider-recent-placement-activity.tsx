import { MetricCard } from "@/components/metric-card";
import {
  BriefingSnapshotGrid,
  DecisionBriefingSection,
} from "@/components/ui/decision-briefing-section";
import type { ProviderMetricsDto } from "@/lib/types/domain";
import {
  formatRecentPlacementActivityPrimary,
} from "@/lib/providers/outreach-factors";
import { formatCount, formatPercent, formatReportingDate } from "@/lib/utils/formatters";

type ProviderRecentPlacementActivityProps = {
  provider: ProviderMetricsDto;
};

export function ProviderRecentPlacementActivity({ provider }: ProviderRecentPlacementActivityProps) {
  const engagementPercent =
    provider.engagementRateLast365 === null
      ? "—"
      : formatPercent(provider.engagementRateLast365);

  return (
    <DecisionBriefingSection
      titleId="provider-recent-activity-heading"
      title="Placement activity during the past 12 months"
      lead={`How often this provider had an active foster-home placement during the 12-month period ending ${formatReportingDate(provider.reportingDate)}.`}
    >
      <BriefingSnapshotGrid className="xl:grid-cols-3">
        <MetricCard
          label="Days with an active placement"
          value={formatRecentPlacementActivityPrimary(provider.activeDaysLast365)}
          helperText="Calendar days with at least one active placement."
        />
        <MetricCard
          label="Eligible licensed days"
          value={formatCount(provider.eligibleLicensedDaysLast365)}
          helperText="Licensed days in the same 12-month window."
        />
        <MetricCard
          label="Engagement rate"
          value={engagementPercent}
          helperText="Share of eligible licensed days with an active placement."
        />
      </BriefingSnapshotGrid>
      <p className="text-sm text-text-secondary">
        This is not a provider-quality rating and does not show how many placement requests were
        offered or declined.
      </p>
    </DecisionBriefingSection>
  );
}
