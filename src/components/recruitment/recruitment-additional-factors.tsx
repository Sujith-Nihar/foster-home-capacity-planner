"use client";

import { useId, useState } from "react";

import { summarizeRecruitmentReason } from "@/lib/recruitment/summary-labels";
import { cn } from "@/lib/utils";

type RecruitmentAdditionalFactorsProps = {
  reasons: string[];
  className?: string;
};

export function RecruitmentAdditionalFactors({ reasons, className }: RecruitmentAdditionalFactorsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const count = reasons.length;

  if (count === 0) {
    return null;
  }

  const noun = count === 1 ? "factor" : "factors";

  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        className="text-left text-xs font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
      >
        View {count} more {noun}
      </button>
      <div id={panelId} hidden={!isOpen} className="mt-1 space-y-1">
        {isOpen
          ? reasons.map((reason) => (
              <p key={reason} className="text-xs leading-snug text-text-secondary">
                {summarizeRecruitmentReason(reason)}
              </p>
            ))
          : null}
      </div>
    </div>
  );
}
