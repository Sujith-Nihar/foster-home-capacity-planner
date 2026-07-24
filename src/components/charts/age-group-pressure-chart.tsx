"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartPanel } from "@/components/charts/chart-panel";
import type { AgeGroupPressureDto } from "@/lib/recruitment/analytics";
import { formatCount, formatRatio } from "@/lib/utils/formatters";

type AgeGroupPressureChartProps = {
  data: AgeGroupPressureDto[];
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: AgeGroupPressureDto }>;
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-text-primary">Age group {point.ageGroup}</p>
      <p className="text-text-secondary">
        Children per matching active provider: {formatRatio(point.childrenPerMatchingActiveProvider)}
      </p>
      <p className="text-text-secondary">Foster-home children: {formatCount(point.fosterChildren)}</p>
      <p className="text-text-secondary">
        Matching active providers: {formatCount(point.matchingActiveProviders)}
      </p>
    </div>
  );
}

function buildSummary(data: AgeGroupPressureDto[]): string {
  if (data.length === 0) {
    return "No age-group pressure ranking is available.";
  }

  return data
    .map(
      (item) =>
        `Age group ${item.ageGroup}: ${formatRatio(item.childrenPerMatchingActiveProvider)} children per matching active provider across ${formatCount(item.fosterChildren)} foster-home children`,
    )
    .join(". ")
    .concat(".");
}

export function AgeGroupPressureChart({ data }: AgeGroupPressureChartProps) {
  const isEmpty = data.length === 0;

  return (
    <ChartPanel
      title="Age-group pressure ranking"
      description="Statewide ranking of age groups by children per matching active provider."
      summary={buildSummary(data)}
      isEmpty={isEmpty}
      emptyDescription="County age-group metrics are not available for the reporting date."
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
          <CartesianGrid stroke="var(--border-default)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            tickFormatter={(value: number) => formatRatio(value)}
          />
          <YAxis
            type="category"
            dataKey="ageGroup"
            width={72}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="childrenPerMatchingActiveProvider"
            name="Children per matching active provider"
            fill="var(--accent-brand)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
