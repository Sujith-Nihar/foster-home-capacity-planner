"use client";

import { PanelRightOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CountyDetailsToggleButtonProps = {
  countyLabel: string;
  isExpanded: boolean;
  panelId: string;
  onToggle: () => void;
  className?: string;
};

export function CountyDetailsToggleButton({
  countyLabel,
  isExpanded,
  panelId,
  onToggle,
  className,
}: CountyDetailsToggleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-expanded={isExpanded}
      aria-controls={panelId}
      aria-label={`${isExpanded ? "Close" : "Open"} ${countyLabel} details`}
      onClick={onToggle}
      className={cn(
        "size-9 shrink-0 rounded-[9px] border-border-subtle bg-surface-raised p-0 text-brand-navy shadow-none",
        "hover:border-brand-blue/35 hover:bg-brand-blue/5",
        "focus-visible:border-brand-blue/50 focus-visible:ring-2 focus-visible:ring-brand-blue/25",
        "aria-expanded:border-brand-blue/40 aria-expanded:bg-brand-blue/8",
        className,
      )}
    >
      <PanelRightOpen className="size-4" aria-hidden="true" />
    </Button>
  );
}
