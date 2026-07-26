"use client";

import { CircleCheck, Flag, Signal } from "lucide-react";

import { AccessibleInfoPopover } from "@/components/shared/accessible-info-popover";
import type { OutreachPriority } from "@/lib/types/domain";
import {
  formatOutreachPriorityAccessibleLabel,
  formatOutreachPriorityBadgeLabel,
  getOutreachPriorityBadgeExplanation,
  getOutreachPriorityBadgeLevel,
  getOutreachPriorityBadgeTitle,
  type OutreachPriorityBadgeLevel,
} from "@/lib/retention/attention-labels";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<
  OutreachPriorityBadgeLevel,
  { icon: typeof Flag; className: string }
> = {
  high: {
    icon: Flag,
    className: "outreach-priority-badge--high",
  },
  medium: {
    icon: Signal,
    className: "outreach-priority-badge--medium",
  },
  low: {
    icon: CircleCheck,
    className: "outreach-priority-badge--low",
  },
};

type OutreachPriorityBadgeProps = {
  priority: OutreachPriority;
  primaryReason?: string | null;
  className?: string;
};

function OutreachPriorityBadgeTooltipContent({
  title,
  explanation,
  primaryReason,
}: {
  title: string;
  explanation: string;
  primaryReason?: string | null;
}) {
  return (
    <div className="outreach-priority-badge-tooltip">
      <p className="outreach-priority-badge-tooltip__title">{title}</p>
      <p className="outreach-priority-badge-tooltip__body">{explanation}</p>
      {primaryReason ? (
        <div className="outreach-priority-badge-tooltip__reason">
          <p className="outreach-priority-badge-tooltip__reason-label">Main reason</p>
          <p className="outreach-priority-badge-tooltip__body">{primaryReason}</p>
        </div>
      ) : null}
    </div>
  );
}

export function OutreachPriorityBadge({
  priority,
  primaryReason,
  className,
}: OutreachPriorityBadgeProps) {
  const level = getOutreachPriorityBadgeLevel(priority);
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;
  const visibleLabel = formatOutreachPriorityBadgeLabel(priority);
  const accessibleLabel = formatOutreachPriorityAccessibleLabel(priority);
  const title = getOutreachPriorityBadgeTitle(priority);
  const explanation = getOutreachPriorityBadgeExplanation(priority);

  const badge = (
    <span
      className={cn(
        "outreach-priority-badge priority-badge",
        config.className,
        className,
      )}
    >
      <Icon className="priority-badge__icon" aria-hidden="true" />
      <span className="priority-badge__label">{visibleLabel}</span>
    </span>
  );

  return (
    <AccessibleInfoPopover
      triggerContent={badge}
      triggerLabel={`${accessibleLabel}. Show explanation.`}
      triggerClassName="outreach-priority-badge-trigger"
      side="top"
      contentClassName="outreach-priority-badge-popover"
    >
      <OutreachPriorityBadgeTooltipContent
        title={title}
        explanation={explanation}
        primaryReason={primaryReason}
      />
    </AccessibleInfoPopover>
  );
}
