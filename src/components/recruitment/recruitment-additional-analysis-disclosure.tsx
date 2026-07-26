"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export const RECRUITMENT_ADDITIONAL_ANALYSIS_CONTENT_ID = "recruitment-additional-analysis-content";

type RecruitmentAdditionalAnalysisDisclosureProps = {
  children: React.ReactNode;
};

export function RecruitmentAdditionalAnalysisDisclosure({
  children,
}: RecruitmentAdditionalAnalysisDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = RECRUITMENT_ADDITIONAL_ANALYSIS_CONTENT_ID;

  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
    requestAnimationFrame(() => {
      toggleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <section className="rounded-[var(--radius-hero)] border border-border-subtle bg-surface-raised p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-[clamp(1.625rem,2.5vw,2.125rem)] font-medium tracking-tight text-text-primary">
            Additional recruitment analysis
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-text-secondary">
            Optional chart comparing county placement pressure and out-of-county placement patterns.
          </p>
        </div>
        <button
          ref={toggleRef}
          type="button"
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-brand-navy",
            "hover:border-brand-blue/35 hover:bg-brand-blue/8",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-expanded={isOpen}
          aria-controls={panelId}
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

      <div id={panelId} hidden={!isOpen} className="mt-5">
        {isOpen ? children : null}
      </div>
    </section>
  );
}
