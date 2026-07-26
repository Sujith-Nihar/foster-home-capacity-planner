import {
  Baby,
  Building2,
  HeartHandshake,
  MapPin,
  Users,
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { BriefingSnapshotGrid } from "@/components/ui/decision-briefing-section";
import type { CountyMetricsDto } from "@/lib/types/domain";
import { formatCount, formatRatio } from "@/lib/utils/formatters";

import { CountyCollapsibleSection } from "./county-collapsible-section";

type CountyAdditionalContextProps = {
  county: CountyMetricsDto;
};

export function CountyAdditionalContext({ county }: CountyAdditionalContextProps) {
  return (
    <CountyCollapsibleSection
      title="Additional county context"
      preview="Kin, nonfamily, licensed provider counts, and detailed placement context."
    >
      <div className="space-y-6">
        <section aria-labelledby="county-additional-placement-heading">
          <h3
            id="county-additional-placement-heading"
            className="text-base font-medium text-text-primary"
          >
            Additional placement context
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
            Kin and nonfamily placements are shown for context and are not automatically treated as
            standard foster-home recruitment demand.
          </p>
          <BriefingSnapshotGrid className="mt-4 xl:grid-cols-2">
            <MetricCard
              label="Current kin placements"
              value={formatCount(county.currentKinChildren)}
              icon={<HeartHandshake className="size-4" aria-hidden="true" />}
            />
            <MetricCard
              label="Current nonfamily placements"
              value={formatCount(county.currentNonfamilyChildren)}
              icon={<Building2 className="size-4" aria-hidden="true" />}
            />
          </BriefingSnapshotGrid>
        </section>

        <section aria-labelledby="county-provider-base-heading">
          <h3
            id="county-provider-base-heading"
            className="text-base font-medium text-text-primary"
          >
            Licensed provider base
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
            Licensed and engaged provider counts describe the current provider base. They are not
            available beds, vacancies, or guaranteed placement capacity.
          </p>
          <BriefingSnapshotGrid className="mt-4 xl:grid-cols-3">
            <MetricCard
              label="Licensed providers"
              value={formatCount(county.licensedProviders)}
              icon={<Users className="size-4" aria-hidden="true" />}
            />
            <MetricCard
              label="Inactive licensed providers"
              value={formatCount(county.inactiveProviders)}
            />
            <MetricCard
              label="Current foster-home children"
              value={formatCount(county.currentFosterHomeChildren)}
              icon={<Baby className="size-4" aria-hidden="true" />}
            />
          </BriefingSnapshotGrid>
        </section>

        <section aria-labelledby="county-placement-pressure-heading">
          <h3
            id="county-placement-pressure-heading"
            className="text-base font-medium text-text-primary"
          >
            Detailed placement pressure
          </h3>
          <BriefingSnapshotGrid className="mt-4 xl:grid-cols-2">
            <MetricCard
              label="Out-of-county foster-home children"
              value={formatCount(county.outOfCountyFosterCount)}
              icon={<MapPin className="size-4" aria-hidden="true" />}
            />
            <MetricCard
              label="Children per engaged provider"
              value={formatRatio(county.childrenPerActiveProvider)}
            />
          </BriefingSnapshotGrid>
        </section>
      </div>
    </CountyCollapsibleSection>
  );
}
