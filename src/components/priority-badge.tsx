import {
  AlertTriangle,
  CircleHelp,
  CircleMinus,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type AttentionLevel = "high" | "medium" | "low" | "limited";

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
      return "limited";
  }
}

export function PriorityBadge({ level, label, className }: PriorityBadgeProps) {
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
