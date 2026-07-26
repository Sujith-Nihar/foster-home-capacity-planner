"use client";

import { CircleCheck, CircleHelp, Flag, Signal } from "lucide-react";

import { RecruitmentAttentionInfoPopover } from "@/components/recruitment/recruitment-attention-info-popover";
import type { SuggestedRecruitmentAttention } from "@/lib/recruitment/classification";
import {
  formatRecruitmentAttentionAccessibleLabel,
  formatRecruitmentAttentionBadgeLabel,
  getRecruitmentAttentionBadgeExplanation,
  getRecruitmentAttentionBadgeLevel,
  getRecruitmentAttentionBadgeTitle,
  type RecruitmentAttentionBadgeLevel,
} from "@/lib/recruitment/attention-labels";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<
  RecruitmentAttentionBadgeLevel,
  { icon: typeof Flag; className: string }
> = {
  high: {
    icon: Flag,
    className: "recruitment-attention-badge--high",
  },
  medium: {
    icon: Signal,
    className: "recruitment-attention-badge--medium",
  },
  low: {
    icon: CircleCheck,
    className: "recruitment-attention-badge--low",
  },
  limited: {
    icon: CircleHelp,
    className: "recruitment-attention-badge--limited",
  },
};

type RecruitmentAttentionBadgeProps = {
  attention: SuggestedRecruitmentAttention;
  isLimitedData: boolean;
  primaryReason?: string | null;
  compact?: boolean;
  className?: string;
};

function RecruitmentAttentionBadgeTooltipContent({
  title,
  explanation,
  primaryReason,
}: {
  title: string;
  explanation: string;
  primaryReason?: string | null;
}) {
  return (
    <div className="recruitment-attention-badge-tooltip">
      <p className="recruitment-attention-badge-tooltip__title">{title}</p>
      <p className="recruitment-attention-badge-tooltip__body">{explanation}</p>
      {primaryReason ? (
        <div className="recruitment-attention-badge-tooltip__reason">
          <p className="recruitment-attention-badge-tooltip__reason-label">Main reason</p>
          <p className="recruitment-attention-badge-tooltip__body">{primaryReason}</p>
        </div>
      ) : null}
    </div>
  );
}

export function RecruitmentAttentionBadge({
  attention,
  isLimitedData,
  primaryReason,
  compact = false,
  className,
}: RecruitmentAttentionBadgeProps) {
  const level = getRecruitmentAttentionBadgeLevel(attention, isLimitedData);
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;
  const visibleLabel = formatRecruitmentAttentionBadgeLabel(
    attention,
    isLimitedData,
    compact ? "compact" : "full",
  );
  const accessibleLabel = formatRecruitmentAttentionAccessibleLabel(attention, isLimitedData);
  const title = getRecruitmentAttentionBadgeTitle(attention, isLimitedData);
  const explanation = getRecruitmentAttentionBadgeExplanation(attention, isLimitedData);
  const showPrimaryReason = Boolean(primaryReason) && !isLimitedData;

  const badge = (
    <span
      className={cn(
        "recruitment-attention-badge priority-badge",
        config.className,
        className,
      )}
    >
      <Icon className="priority-badge__icon" aria-hidden="true" />
      <span className="priority-badge__label">{visibleLabel}</span>
    </span>
  );

  return (
    <RecruitmentAttentionInfoPopover
      trigger={badge}
      triggerLabel={`${accessibleLabel}. Show explanation.`}
      side="top"
      contentClassName="recruitment-attention-badge-popover"
    >
      <RecruitmentAttentionBadgeTooltipContent
        title={title}
        explanation={explanation}
        primaryReason={showPrimaryReason ? primaryReason : null}
      />
    </RecruitmentAttentionInfoPopover>
  );
}
