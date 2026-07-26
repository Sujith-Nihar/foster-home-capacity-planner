import { Calendar, Clock, UserCheck } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import {
  formatDaysSinceLastPlacementMetric,
  formatRecentPlacementActivityPrimary,
  formatRecentPlacementActivitySecondary,
  isLicenseTimingUrgent,
} from "@/lib/providers/outreach-factors";
import type { ProviderMetricsDto } from "@/lib/types/domain";
import { formatEndsInDayCount } from "@/lib/utils/pluralization";
import { formatReportingDate } from "@/lib/utils/formatters";
import {
  BriefingSnapshotGrid,
  DecisionBriefingSection,
} from "@/components/ui/decision-briefing-section";

type ProviderKeyRetentionMetricsProps = {
  provider: ProviderMetricsDto;
};

export function ProviderKeyRetentionMetrics({ provider }: ProviderKeyRetentionMetricsProps) {
  const daysSinceLastPlacement = formatDaysSinceLastPlacementMetric(provider);

  return (
    <DecisionBriefingSection
      titleId="provider-key-metrics-heading"
      title="Key review summary"
      lead="The most important placement, license, and activity facts for staff review."
    >
      <BriefingSnapshotGrid className="xl:grid-cols-4">
        <MetricCard
          label="Current placement status"
          value={
            provider.currentlyHasPlacement ? "Has a current placement" : "No current placement"
          }
          icon={<UserCheck className="size-4" aria-hidden="true" />}
        />
        <MetricCard
          label="License timing"
          value={formatEndsInDayCount(provider.daysUntilExpiration)}
          helperText={formatReportingDate(provider.licenseEndDate)}
          icon={<Clock className="size-4" aria-hidden="true" />}
          variant={isLicenseTimingUrgent(provider.daysUntilExpiration) ? "attention" : "default"}
        />
        <MetricCard
          label="Recent placement activity"
          value={formatRecentPlacementActivityPrimary(provider.activeDaysLast365)}
          helperText={formatRecentPlacementActivitySecondary(provider)}
        />
        <MetricCard
          label="Days since last placement"
          value={daysSinceLastPlacement.value}
          helperText={daysSinceLastPlacement.helperText}
          icon={<Calendar className="size-4" aria-hidden="true" />}
        />
      </BriefingSnapshotGrid>
    </DecisionBriefingSection>
  );
}
