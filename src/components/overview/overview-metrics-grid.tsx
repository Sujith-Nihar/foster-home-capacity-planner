import { Baby, HeartHandshake, Home } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import type { SystemSnapshotDto } from "@/lib/types/domain";
import { formatCount, formatPercent } from "@/lib/utils/formatters";

type OverviewMetricsGridProps = {
  snapshot: SystemSnapshotDto;
};

export function OverviewMetricsGrid({ snapshot }: OverviewMetricsGridProps) {
  const fosterShare =
    snapshot.currentChildrenInCare > 0
      ? snapshot.currentFosterHomeChildren / snapshot.currentChildrenInCare
      : 0;

  return (
    <section aria-labelledby="overview-kpi-heading" className="space-y-4">
      <h2
        id="overview-kpi-heading"
        className="text-xl font-medium tracking-tight text-text-primary sm:text-2xl"
      >
        Statewide snapshot
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Current children in care"
          value={formatCount(snapshot.currentChildrenInCare)}
          helperText={`${formatPercent(fosterShare)} in foster-home placements statewide`}
          icon={<Baby className="size-4" aria-hidden="true" />}
        />
        <MetricCard
          label="Current foster-home placements"
          value={formatCount(snapshot.currentFosterHomeChildren)}
          helperText="Review county recruitment priorities"
          icon={<Home className="size-4" aria-hidden="true" />}
          href="/recruitment"
        />
        <MetricCard
          label="Current kin placements"
          value={formatCount(snapshot.currentKinChildren)}
          helperText="Kin care alongside foster-home demand"
          icon={<HeartHandshake className="size-4" aria-hidden="true" />}
          href="/recruitment"
        />
        <MetricCard
          label="High-priority outreach providers"
          value={formatCount(snapshot.highRetentionProviders)}
          helperText="Providers flagged for retention outreach"
          href="/retention?priority=High"
          variant="attention"
        />
      </div>
    </section>
  );
}
