"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetricHelpTooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function MetricHelpTooltip({ label, children, className }: MetricHelpTooltipProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const node = detailsRef.current;
    if (!node) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!node?.open) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !node.contains(target)) {
        node.open = false;
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <details ref={detailsRef} className={cn("relative inline-block", className)}>
      <summary className="cursor-pointer text-sm font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {label}
      </summary>
      <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-border-subtle bg-surface-raised p-3 text-xs leading-5 text-text-secondary shadow-sm">
        {children}
      </div>
    </details>
  );
}
