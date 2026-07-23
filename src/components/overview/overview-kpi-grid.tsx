import {
  Baby,
  HeartHandshake,
  Home,
  ShieldAlert,
  UserCheck,
  Users,
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import type { SystemSnapshotDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type OverviewKpiGridProps = {
  snapshot: SystemSnapshotDto;
};

export function OverviewKpiGrid({ snapshot }: OverviewKpiGridProps) {
  return (
    <section aria-labelledby="overview-kpi-heading" className="space-y-4">
      <h2 id="overview-kpi-heading" className="text-lg font-semibold text-text-primary">
        Statewide snapshot
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Current children in care"
          value={formatCount(snapshot.currentChildrenInCare)}
          helperText="All placement types statewide"
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
          label="Currently licensed providers"
          value={formatCount(snapshot.currentlyLicensedProviders)}
          helperText="Licensed beyond the reporting date"
          icon={<Users className="size-4" aria-hidden="true" />}
          href="/retention"
        />
        <MetricCard
          label="Currently active providers"
          value={formatCount(snapshot.currentlyActiveProviders)}
          helperText="Providers with foster-home placement activity"
          icon={<UserCheck className="size-4" aria-hidden="true" />}
          href="/retention"
        />
        <MetricCard
          label="High-priority outreach providers"
          value={formatCount(snapshot.highRetentionProviders)}
          helperText="Providers classified as high outreach priority"
          icon={<ShieldAlert className="size-4" aria-hidden="true" />}
          href="/retention?priority=High"
        />
      </div>
    </section>
  );
}
