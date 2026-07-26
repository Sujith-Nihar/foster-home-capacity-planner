"use client";

import type { ReactNode } from "react";

import { ChartCard } from "@/components/chart-card";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

type OverviewChartPanelProps = {
  title: string;
  titleId?: string;
  description: string;
  takeaway: string;
  detailedSummary: string;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;
  className?: string;
};

function slugifyTitle(title: string): string {
  return title.replace(/\s+/g, "-").toLowerCase();
}

export function OverviewChartPanel({
  title,
  titleId,
  description,
  takeaway,
  detailedSummary,
  isEmpty = false,
  emptyTitle = "No chart data available",
  emptyDescription = "There is not enough data to display this chart for the current reporting date.",
  children,
  className,
}: OverviewChartPanelProps) {
  const summaryId = titleId ?? `${slugifyTitle(title)}-summary`;

  return (
    <ChartCard title={title} description={description} className={cn("overview-chart-panel", className)}>
      <p className="overview-chart-panel__takeaway text-sm leading-6 text-text-secondary">
        {takeaway}
      </p>
      <p id={summaryId} className="sr-only">
        Chart summary: {detailedSummary}
      </p>
      {isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div role="img" aria-labelledby={summaryId} className="overview-chart-panel__plot min-h-52 w-full">
          {children}
        </div>
      )}
    </ChartCard>
  );
}
