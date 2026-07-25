"use client";

import type { ReactNode } from "react";

type OperationalResultsRegionProps = {
  children: ReactNode;
  isPending?: boolean;
  label: string;
};

export function OperationalResultsRegion({
  children,
  isPending = false,
  label,
}: OperationalResultsRegionProps) {
  return (
    <div aria-busy={isPending || undefined} aria-label={label} className="operational-results-region">
      {children}
    </div>
  );
}
