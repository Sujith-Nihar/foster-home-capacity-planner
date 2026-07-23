import { Baby, HeartHandshake, Home } from "lucide-react";

import { BentoMetricCard, BentoProviderStrip } from "@/components/ui/bento-metric-card";
import type { SystemSnapshotDto } from "@/lib/types/domain";
import { formatCount, formatPercent } from "@/lib/utils/formatters";

type OverviewBentoGridProps = {
  snapshot: SystemSnapshotDto;
};

export function OverviewBentoGrid({ snapshot }: OverviewBentoGridProps) {
  const fosterShare =
    snapshot.currentChildrenInCare > 0
      ? snapshot.currentFosterHomeChildren / snapshot.currentChildrenInCare
      : 0;

  return (
    <section aria-labelledby="overview-kpi-heading" className="space-y-5">
      <h2 id="overview-kpi-heading" className="text-xl font-medium tracking-tight text-text-primary sm:text-2xl">
        Statewide snapshot
      </h2>
      <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
        <div className="lg:col-span-7 lg:row-span-2">
          <BentoMetricCard
            label="Current children in care"
            value={formatCount(snapshot.currentChildrenInCare)}
            helperText={`${formatPercent(fosterShare)} in foster-home placements statewide`}
            icon={<Baby className="size-4" aria-hidden="true" />}
            variant="featured"
            className="min-h-[220px]"
          />
        </div>
        <div className="lg:col-span-5">
          <BentoMetricCard
            label="Current foster-home placements"
            value={formatCount(snapshot.currentFosterHomeChildren)}
            helperText="Review county recruitment priorities"
            icon={<Home className="size-4" aria-hidden="true" />}
            href="/recruitment"
          />
        </div>
        <div className="lg:col-span-5">
          <BentoMetricCard
            label="Current kin placements"
            value={formatCount(snapshot.currentKinChildren)}
            helperText="Kin care alongside foster-home demand"
            icon={<HeartHandshake className="size-4" aria-hidden="true" />}
            href="/recruitment"
          />
        </div>
        <div className="lg:col-span-12">
          <BentoProviderStrip
            items={[
              {
                label: "Currently licensed providers",
                value: formatCount(snapshot.currentlyLicensedProviders),
                href: "/retention",
              },
              {
                label: "Currently active providers",
                value: formatCount(snapshot.currentlyActiveProviders),
                href: "/retention",
              },
              {
                label: "High-priority outreach providers",
                value: formatCount(snapshot.highRetentionProviders),
                href: "/retention?priority=High",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
