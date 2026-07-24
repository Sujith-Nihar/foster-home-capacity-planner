"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartPanel } from "@/components/charts/chart-panel";
import type { CountyMetricsDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type LargestCountiesChartProps = {
  counties: CountyMetricsDto[];
};

type ChartPoint = {
  county: string;
  fosterChildren: number;
  activeProviders: number;
};

function buildChartPoints(counties: CountyMetricsDto[]): ChartPoint[] {
  return counties.map((county) => ({
    county: county.county,
    fosterChildren: county.currentFosterHomeChildren,
    activeProviders: county.activeProviders,
  }));
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-text-primary">{label} County</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-text-secondary">
          {entry.name}: {formatCount(entry.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function buildSummary(points: ChartPoint[]): string {
  if (points.length === 0) {
    return "No county comparison data is available.";
  }

  return points
    .map(
      (point) =>
        `${point.county} County: ${formatCount(point.fosterChildren)} foster-home children and ${formatCount(point.activeProviders)} active providers`,
    )
    .join(". ")
    .concat(".");
}

export function LargestCountiesChart({ counties }: LargestCountiesChartProps) {
  const points = buildChartPoints(counties);
  const isEmpty =
    points.length === 0 ||
    points.every((point) => point.fosterChildren === 0 && point.activeProviders === 0);

  return (
    <ChartPanel
      title="Largest-county comparison"
      description="Counties with the highest foster-home placement counts compared to active provider supply."
      summary={buildSummary(points)}
      isEmpty={isEmpty}
      emptyDescription="No county-level placement counts are available for comparison."
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-default)" vertical={false} />
          <XAxis
            dataKey="county"
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border-default)" }}
          />
          <YAxis
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border-default)" }}
            tickFormatter={(value: number) => formatCount(value)}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <Bar
            dataKey="fosterChildren"
            name="Foster-home children"
            fill="var(--accent-brand)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="activeProviders"
            name="Active providers"
            fill="var(--status-low-fg)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
