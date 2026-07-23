"use client";

import type { ReactNode } from "react";

import { ChartCard } from "@/components/chart-card";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

type ChartPanelProps = {
  title: string;
  description: string;
  summary: string;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;
  className?: string;
};

export function ChartPanel({
  title,
  description,
  summary,
  isEmpty = false,
  emptyTitle = "No chart data available",
  emptyDescription = "There is not enough data to display this chart for the current reporting date.",
  children,
  className,
}: ChartPanelProps) {
  return (
    <ChartCard title={title} description={description} className={className}>
      <p id={`${title.replace(/\s+/g, "-").toLowerCase()}-summary`} className="sr-only">
        {summary}
      </p>
      {isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div
          role="img"
          aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-summary`}
          className={cn("min-h-56 w-full")}
        >
          {children}
        </div>
      )}
    </ChartCard>
  );
}
