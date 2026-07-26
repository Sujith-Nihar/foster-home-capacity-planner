"use client";

import { Info } from "lucide-react";

import { RecruitmentAttentionBadge } from "@/components/recruitment/recruitment-attention-badge";
import { RecruitmentAttentionInfoPopover } from "@/components/recruitment/recruitment-attention-info-popover";
import {
  getComparisonStatus,
  getSuggestedRecruitmentAttention,
  isLimitedDataCounty,
} from "@/lib/recruitment/classification";
import { formatCountyComparisonStatusDisplayLabel } from "@/lib/recruitment/county-detail";
import type { CountyMetricsDto } from "@/lib/types/domain";

type CountyDetailHeroAsideProps = {
  county: CountyMetricsDto;
  primaryReason?: string | null;
};

function CountyComparisonStatus({ county }: { county: CountyMetricsDto }) {
  const status = getComparisonStatus(county);
  const label = formatCountyComparisonStatusDisplayLabel(status);

  if (status !== "Eligible") {
    return (
      <p className="text-sm text-text-secondary">
        <span className="font-medium text-text-primary">Comparison status: </span>
        {label}
      </p>
    );
  }

  return (
    <p className="text-sm text-text-secondary">
      <span className="font-medium text-text-primary">Comparison status: </span>
      <RecruitmentAttentionInfoPopover
        trigger={
          <span className="inline-flex items-center gap-1 text-text-secondary underline decoration-dotted underline-offset-4">
            {label}
            <Info className="size-3.5 shrink-0 text-text-tertiary" aria-hidden="true" />
          </span>
        }
        triggerLabel={`${label}. Show explanation.`}
        contentClassName="county-comparison-status-popover"
        side="bottom"
      >
        <div className="county-comparison-status-tooltip">
          <p className="county-comparison-status-tooltip__body">
            Meets the minimum child and engaged-provider counts required for stable county
            comparison.
          </p>
        </div>
      </RecruitmentAttentionInfoPopover>
    </p>
  );
}

export function CountyDetailHeroAside({ county, primaryReason }: CountyDetailHeroAsideProps) {
  const isLimitedData = isLimitedDataCounty(county);
  const attention = getSuggestedRecruitmentAttention(county);

  return (
    <div className="space-y-2">
      <RecruitmentAttentionBadge
        attention={attention}
        isLimitedData={isLimitedData}
        primaryReason={primaryReason}
      />
      <CountyComparisonStatus county={county} />
    </div>
  );
}
