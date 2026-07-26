"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export const ADDITIONAL_STATEWIDE_ANALYSIS_CONTENT_ID = "additional-statewide-analysis-content";

type OverviewAdditionalAnalysisDisclosureProps = {
  heading: ReactNode;
  children: ReactNode;
};

export function OverviewAdditionalAnalysisDisclosure({
  heading,
  children,
}: OverviewAdditionalAnalysisDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
    requestAnimationFrame(() => {
      toggleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {heading}
        <button
          ref={toggleRef}
          type="button"
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-brand-navy",
            "hover:border-brand-blue/35 hover:bg-brand-blue/8",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-expanded={isOpen}
          aria-controls={ADDITIONAL_STATEWIDE_ANALYSIS_CONTENT_ID}
          onClick={handleToggle}
        >
          {isOpen ? "Hide analysis" : "Show analysis"}
          <ChevronDown
            className={cn(
              "size-4 transition-transform motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      <div id={ADDITIONAL_STATEWIDE_ANALYSIS_CONTENT_ID} hidden={!isOpen}>
        {isOpen ? children : null}
      </div>
    </div>
  );
}
