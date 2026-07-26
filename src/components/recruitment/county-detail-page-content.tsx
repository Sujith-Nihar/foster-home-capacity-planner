import { Baby, MapPin, Users } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import {
  BriefingSnapshotGrid,
  DecisionBriefingSection,
} from "@/components/ui/decision-briefing-section";
import { RECRUITMENT_INDICATORS_CAVEAT } from "@/content/methodology";
import type { CountyPageData } from "@/lib/data/counties";
import {
  buildCountyReviewFindings,
  formatOutOfCountyPlacementDisplay,
} from "@/lib/recruitment/county-detail";
import { isLimitedDataCounty } from "@/lib/recruitment/classification";
import { formatCount, formatRatio } from "@/lib/utils/formatters";

import { CountyAdditionalContext } from "./county-additional-context";
import { CountyAgeGroupFocus } from "./county-age-group-focus";
import { CountyLimitationsDisclosure } from "./county-limitations-disclosure";
import { CountyRetentionTable } from "./county-retention-table";
import { CountyRetentionWatch } from "./county-retention-watch";

type CountyDetailPageContentProps = {
  data: CountyPageData;
};

export function CountyDetailPageContent({ data }: CountyDetailPageContentProps) {
  const {
    county,
    ageGroups,
    statewideAgeGroupBenchmarks,
    retentionProviders,
    limitations,
  } = data;

  const reviewFindings = buildCountyReviewFindings(county);
  const showReviewSection = !isLimitedDataCounty(county) && reviewFindings.length > 0;

  return (
    <div className="space-y-8">
      <DecisionBriefingSection
        titleId="county-signals-heading"
        title="Key recruitment signals"
      >
        <BriefingSnapshotGrid className="xl:grid-cols-4">
          <MetricCard
            label="Current foster-home children"
            value={formatCount(county.currentFosterHomeChildren)}
            helperText="Children currently in foster-home placements from this county."
            icon={<Baby className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Engaged local providers"
            value={formatCount(county.activeProviders)}
            helperText="Currently licensed local providers with an active foster-home placement."
            icon={<Users className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Children per engaged provider"
            value={formatRatio(county.childrenPerActiveProvider)}
            helperText="Higher values indicate more children relative to the engaged local provider base."
          />
          <MetricCard
            label="Placed outside home county"
            value={formatOutOfCountyPlacementDisplay(
              county.outOfCountyFosterCount,
              county.outOfCountyFosterRate,
            )}
            helperText="Share of current foster-home children placed in another county."
            icon={<MapPin className="size-4" aria-hidden="true" />}
          />
        </BriefingSnapshotGrid>
      </DecisionBriefingSection>

      {showReviewSection ? (
        <DecisionBriefingSection
          titleId="county-priority-reasons-heading"
          title="Why this county warrants review"
          tone="raised"
        >
          <dl className="space-y-4">
            {reviewFindings.map((finding) => (
              <div key={finding.title}>
                <dt className="text-sm font-medium text-text-primary">{finding.title}</dt>
                <dd className="mt-1 text-sm leading-6 text-text-secondary">{finding.description}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-text-secondary">
            Compared with counties that have at least 10 current foster-home children and 3 engaged
            providers.
          </p>
          <p className="mt-2 text-sm text-text-secondary">{RECRUITMENT_INDICATORS_CAVEAT}</p>
        </DecisionBriefingSection>
      ) : null}

      <CountyAgeGroupFocus
        ageGroups={ageGroups}
        statewideAgeGroupBenchmarks={statewideAgeGroupBenchmarks}
      />

      <CountyRetentionWatch county={county} />

      <CountyRetentionTable
        county={county.county}
        providers={retentionProviders}
      />

      <CountyAdditionalContext county={county} />

      <CountyLimitationsDisclosure limitations={limitations} />
    </div>
  );
}
