"use client";

import type { ReactNode } from "react";

import { ChartCard } from "@/components/chart-card";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

type ChartPanelProps = {
  title: string;
  titleId?: string;
  description: string;
  summary: string;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;
  className?: string;
};

function slugifyTitle(title: string): string {
  return title.replace(/\s+/g, "-").toLowerCase();
}

export function ChartPanel({
  title,
  titleId,
  description,
  summary,
  isEmpty = false,
  emptyTitle = "No chart data available",
  emptyDescription = "There is not enough data to display this chart for the current reporting date.",
  children,
  className,
}: ChartPanelProps) {
  const summaryId = titleId ?? `${slugifyTitle(title)}-summary`;

  return (
    <ChartCard title={title} description={description} className={className}>
      <p id={summaryId} className="mb-4 text-sm leading-6 text-text-secondary">
        <span className="sr-only">Chart summary: </span>
        {summary}
      </p>
      {isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div
          role="img"
          aria-labelledby={summaryId}
          className={cn("min-h-56 w-full")}
        >
          {children}
        </div>
      )}
    </ChartCard>
  );
}
