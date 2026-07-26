import { Calendar } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import {
  BriefingSnapshotGrid,
  DecisionBriefingSection,
} from "@/components/ui/decision-briefing-section";
import type { ProviderMetricsDto } from "@/lib/types/domain";
import { formatReportingDate } from "@/lib/utils/formatters";

type ProviderLicensePreferencesProps = {
  provider: ProviderMetricsDto;
  preferredAgeRangeLabel: string;
  ageGroupOverlapNote: string | null;
};

export function ProviderLicensePreferences({
  provider,
  preferredAgeRangeLabel,
  ageGroupOverlapNote,
}: ProviderLicensePreferencesProps) {
  return (
    <DecisionBriefingSection
      titleId="provider-license-preferences-heading"
      title="License and placement preferences"
      lead="License period and the provider's licensed age preferences."
    >
      <BriefingSnapshotGrid className="xl:grid-cols-3">
        <MetricCard
          label="License start date"
          value={formatReportingDate(provider.licenseStartDate)}
          icon={<Calendar className="size-4" aria-hidden="true" />}
        />
        <MetricCard
          label="License end date"
          value={formatReportingDate(provider.licenseEndDate)}
          icon={<Calendar className="size-4" aria-hidden="true" />}
        />
        <MetricCard
          label="Preferred age range"
          value={preferredAgeRangeLabel}
          helperText={ageGroupOverlapNote ?? undefined}
        />
      </BriefingSnapshotGrid>
    </DecisionBriefingSection>
  );
}
