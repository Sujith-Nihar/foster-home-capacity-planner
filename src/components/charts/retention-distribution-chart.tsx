"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartPanel } from "@/components/charts/chart-panel";
import type { RetentionPriorityDistributionDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type RetentionDistributionChartProps = {
  data: RetentionPriorityDistributionDto;
};

const PRIORITY_COLORS = {
  High: "var(--status-high-fg)",
  Medium: "var(--status-medium-fg)",
  Low: "var(--status-low-fg)",
} as const;

type ChartPoint = {
  priority: keyof typeof PRIORITY_COLORS;
  count: number;
};

function buildChartPoints(data: RetentionPriorityDistributionDto): ChartPoint[] {
  return [
    { priority: "High", count: data.high },
    { priority: "Medium", count: data.medium },
    { priority: "Low", count: data.low },
  ];
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-text-primary">{point.priority} outreach priority</p>
      <p className="text-text-secondary">Providers: {formatCount(point.count)}</p>
    </div>
  );
}

function buildSummary(points: ChartPoint[]): string {
  const total = points.reduce((sum, point) => sum + point.count, 0);
  if (total === 0) {
    return "No provider outreach priority distribution is available.";
  }

  return points
    .map((point) => `${point.priority} priority: ${formatCount(point.count)} providers`)
    .join(". ")
    .concat(`. Total licensed providers with outreach classification: ${formatCount(total)}.`);
}

export function RetentionDistributionChart({ data }: RetentionDistributionChartProps) {
  const points = buildChartPoints(data);
  const total = points.reduce((sum, point) => sum + point.count, 0);
  const isEmpty = total === 0;

  return (
    <ChartPanel
      title="Retention outreach priority distribution"
      description="Licensed providers grouped by outreach priority at the reporting date."
      summary={buildSummary(points)}
      isEmpty={isEmpty}
      emptyDescription="No provider outreach priority counts are available."
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-default)" vertical={false} />
          <XAxis
            dataKey="priority"
            tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border-default)" }}
          />
          <YAxis
            tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border-default)" }}
            tickFormatter={(value: number) => formatCount(value)}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" name="Providers" radius={[4, 4, 0, 0]}>
            {points.map((point) => (
              <Cell key={point.priority} fill={PRIORITY_COLORS[point.priority]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
