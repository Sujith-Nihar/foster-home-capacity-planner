import Link from "next/link";
import { Clock } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import {
  BriefingSnapshotGrid,
  DecisionBriefingSection,
} from "@/components/ui/decision-briefing-section";
import type { CountyMetricsDto } from "@/lib/types/domain";
import { formatCount, formatCountyName } from "@/lib/utils/formatters";

type CountyRetentionWatchProps = {
  county: CountyMetricsDto;
};

export function CountyRetentionWatch({ county }: CountyRetentionWatchProps) {
  const countyLabel = formatCountyName(county.county);
  const retentionHref = `/retention?county=${encodeURIComponent(county.county)}`;

  return (
    <DecisionBriefingSection
      titleId="county-retention-watch-heading"
      title="Provider retention watch"
      lead="License timing and outreach signals for licensed providers in this county."
      tone="raised"
    >
      <BriefingSnapshotGrid className="xl:grid-cols-4">
        <MetricCard
          label="Licenses ending within 90 days"
          value={formatCount(county.expiring90Days)}
          icon={<Clock className="size-4" aria-hidden="true" />}
        />
        <MetricCard
          label="Licenses ending within 180 days"
          value={formatCount(county.expiring180Days)}
          icon={<Clock className="size-4" aria-hidden="true" />}
        />
        <MetricCard
          label="High-priority outreach providers"
          value={formatCount(county.highRetentionProviders)}
        />
        <MetricCard
          label="Medium-priority outreach providers"
          value={formatCount(county.mediumRetentionProviders)}
        />
      </BriefingSnapshotGrid>

      <p className="mt-4">
        <Link
          href={retentionHref}
          className="text-sm font-medium text-brand-navy underline-offset-4 hover:underline"
        >
          Review all {countyLabel} providers
        </Link>
      </p>
    </DecisionBriefingSection>
  );
}
