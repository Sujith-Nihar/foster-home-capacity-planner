"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CountyBreakdownToggleButtonProps = {
  isExpanded: boolean;
  panelId: string;
  onToggle: () => void;
  className?: string;
};

export function CountyBreakdownToggleButton({
  isExpanded,
  panelId,
  onToggle,
  className,
}: CountyBreakdownToggleButtonProps) {
  const label = isExpanded ? "Hide breakdown" : "View breakdown";
  const Icon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <Button
      type="button"
      variant="outline"
      aria-expanded={isExpanded}
      aria-controls={panelId}
      onClick={onToggle}
      className={cn(
        "h-9 w-full max-w-full shrink-0 gap-1 whitespace-nowrap rounded-[9px] border-brand-blue/30 bg-brand-blue/[0.06] px-3 text-xs font-medium text-brand-navy shadow-none",
        "hover:border-brand-blue/45 hover:bg-brand-blue/10",
        "focus-visible:border-brand-blue/50 focus-visible:ring-2 focus-visible:ring-brand-blue/25",
        "aria-expanded:border-brand-blue/50 aria-expanded:bg-brand-blue/10",
        className,
      )}
    >
      {label}
      <Icon className="size-4 shrink-0" aria-hidden="true" />
    </Button>
  );
}
