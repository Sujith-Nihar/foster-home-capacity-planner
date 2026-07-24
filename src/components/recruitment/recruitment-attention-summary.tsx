import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import type { CountyMetricsDto } from "@/lib/types/domain";
import {
  formatAdditionalFactorsLabel,
  summarizeRecruitmentReason,
} from "@/lib/recruitment/summary-labels";
import { formatCompactRecruitmentPriorityLabel } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

type RecruitmentAttentionSummaryProps = {
  county: CountyMetricsDto;
  className?: string;
};

export function RecruitmentAttentionSummary({
  county,
  className,
}: RecruitmentAttentionSummaryProps) {
  const [primary, ...additional] = county.recruitmentReasons;
  const shortReason = primary ? summarizeRecruitmentReason(primary) : null;
  const additionalLabel = formatAdditionalFactorsLabel(additional.length);

  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <PriorityBadge
        level={priorityToAttentionLevel(county.recruitmentPriority)}
        label={formatCompactRecruitmentPriorityLabel(county.recruitmentPriority)}
        className="whitespace-nowrap"
      />
      {shortReason ? (
        <p className="line-clamp-2 text-xs leading-snug text-text-secondary">{shortReason}</p>
      ) : null}
      {additionalLabel ? (
        <p className="text-xs font-medium text-brand-navy">{additionalLabel}</p>
      ) : null}
    </div>
  );
}
