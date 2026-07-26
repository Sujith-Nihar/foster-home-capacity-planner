import { RecruitmentAttentionBadge } from "@/components/recruitment/recruitment-attention-badge";
import { RecruitmentAdditionalFactors } from "@/components/recruitment/recruitment-additional-factors";
import type { CountyMetricsDto } from "@/lib/types/domain";
import {
  buildDataSufficiencyReason,
  getComparisonStatus,
  getSuggestedRecruitmentAttention,
} from "@/lib/recruitment/classification";
import { summarizeRecruitmentReason } from "@/lib/recruitment/summary-labels";
import { formatComparisonStatusLabel } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

type RecruitmentAttentionSummaryProps = {
  county: CountyMetricsDto;
  className?: string;
};

export function RecruitmentAttentionSummary({
  county,
  className,
}: RecruitmentAttentionSummaryProps) {
  const suggestedAttention = getSuggestedRecruitmentAttention(county);
  const comparisonStatus = getComparisonStatus(county);
  const isLimitedData = comparisonStatus === "Limited data";
  const [primary, ...additional] = county.recruitmentReasons;
  const shortReason = !isLimitedData && primary ? summarizeRecruitmentReason(primary) : null;
  const sufficiencyReason = isLimitedData ? buildDataSufficiencyReason(county) : null;
  const badgePrimaryReason = shortReason ?? sufficiencyReason;

  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <RecruitmentAttentionBadge
        attention={suggestedAttention}
        isLimitedData={isLimitedData}
        primaryReason={badgePrimaryReason}
        compact
      />
      {isLimitedData ? (
        <p className="text-xs leading-snug text-text-secondary">
          <span className="font-medium text-text-primary">Comparison status: </span>
          {formatComparisonStatusLabel(comparisonStatus)}
        </p>
      ) : null}
      {shortReason ? (
        <p className="line-clamp-2 text-xs leading-snug text-text-secondary">{shortReason}</p>
      ) : null}
      {sufficiencyReason ? (
        <p className="line-clamp-3 text-xs leading-snug text-text-secondary">{sufficiencyReason}</p>
      ) : null}
      {!isLimitedData && additional.length > 0 ? (
        <RecruitmentAdditionalFactors reasons={additional} />
      ) : null}
    </div>
  );
}
