import {
  AlertTriangle,
  CircleHelp,
  CircleMinus,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { SuggestedRecruitmentAttention } from "@/lib/recruitment/classification";

export type AttentionLevel = "high" | "medium" | "low" | "limited" | "not-scored";

type PriorityBadgeProps = {
  level: AttentionLevel;
  label: string;
  className?: string;
};

const LEVEL_CONFIG: Record<
  AttentionLevel,
  { icon: LucideIcon; className: string }
> = {
  high: {
    icon: AlertTriangle,
    className:
      "border-status-high-border bg-status-high-bg text-status-high [&>svg]:text-status-high",
  },
  medium: {
    icon: CircleMinus,
    className:
      "border-status-medium-border bg-status-medium-bg text-status-medium [&>svg]:text-status-medium",
  },
  low: {
    icon: CircleCheck,
    className:
      "border-status-low-border bg-status-low-bg text-status-low [&>svg]:text-status-low",
  },
  limited: {
    icon: CircleHelp,
    className: "border-border-strong bg-muted text-text-primary [&>svg]:text-text-secondary",
  },
  "not-scored": {
    icon: CircleHelp,
    className: "border-border-strong bg-muted text-text-secondary [&>svg]:text-text-tertiary",
  },
};

export function priorityToAttentionLevel(
  priority: "High" | "Medium" | "Low" | "Limited data",
): AttentionLevel {
  switch (priority) {
    case "High":
      return "high";
    case "Medium":
      return "medium";
    case "Low":
      return "low";
    case "Limited data":
      return "not-scored";
  }
}

export function suggestedAttentionToLevel(
  attention: SuggestedRecruitmentAttention,
): AttentionLevel {
  switch (attention) {
    case "High":
      return "high";
    case "Medium":
      return "medium";
    case "Low":
      return "low";
    case "Not scored":
      return "not-scored";
  }
}

export function PriorityBadge({ level, label, className }: PriorityBadgeProps) {
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "priority-badge",
        config.className,
        className,
      )}
    >
      <Icon className="priority-badge__icon" aria-hidden="true" />
      <span className="priority-badge__label">{label}</span>
    </span>
  );
}
