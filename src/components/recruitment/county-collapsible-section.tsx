"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type CountyCollapsibleSectionProps = {
  title: string;
  preview?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  tone?: "default" | "raised";
};

const toneClasses = {
  default: "",
  raised: "rounded-2xl border border-border-subtle bg-surface-raised p-5 sm:p-6",
} as const;

export function CountyCollapsibleSection({
  title,
  preview,
  children,
  defaultOpen = false,
  className,
  tone = "default",
}: CountyCollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const panelId = useId();

  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
    requestAnimationFrame(() => {
      toggleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <section
      aria-labelledby={headingId}
      className={cn(toneClasses[tone], className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 id={headingId} className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          {preview ? (
            <p className="max-w-3xl text-sm leading-6 text-text-secondary">{preview}</p>
          ) : null}
        </div>
        <button
          ref={toggleRef}
          type="button"
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-brand-navy",
            "hover:border-brand-blue/35 hover:bg-brand-blue/8",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={handleToggle}
        >
          {isOpen ? "Hide details" : "Show details"}
          <ChevronDown
            className={cn(
              "size-4 transition-transform motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      <div id={panelId} hidden={!isOpen} className={cn(preview ? "mt-4" : "mt-3")}>
        {isOpen ? children : null}
      </div>
    </section>
  );
}
