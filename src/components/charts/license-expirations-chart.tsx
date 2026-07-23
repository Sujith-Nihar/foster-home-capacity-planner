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
import type { MonthlyMetricsDto } from "@/lib/types/domain";
import { formatCount, formatMonthLabel } from "@/lib/utils/formatters";

type LicenseExpirationsChartProps = {
  data: MonthlyMetricsDto[];
};

type ChartPoint = {
  month: string;
  monthLabel: string;
  licenseExpirations: number;
};

function buildChartPoints(data: MonthlyMetricsDto[]): ChartPoint[] {
  return data.slice(-12).map((item) => ({
    month: item.month,
    monthLabel: formatMonthLabel(item.month),
    licenseExpirations: item.licenseExpirations,
  }));
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
      <p className="font-medium text-text-primary">{point.monthLabel}</p>
      <p className="text-text-secondary">
        Expirations: {formatCount(point.licenseExpirations)}
      </p>
    </div>
  );
}

function buildSummary(points: ChartPoint[]): string {
  if (points.length === 0) {
    return "No monthly license expiration data is available.";
  }

  const total = points.reduce((sum, point) => sum + point.licenseExpirations, 0);
  const peak = points.reduce((max, point) =>
    point.licenseExpirations > max.licenseExpirations ? point : max,
  );

  return `License expirations by month from ${points[0]?.monthLabel} to ${points[points.length - 1]?.monthLabel}. Total expirations across the period: ${formatCount(total)}. Highest month: ${peak.monthLabel} with ${formatCount(peak.licenseExpirations)} expirations.`;
}

export function LicenseExpirationsChart({ data }: LicenseExpirationsChartProps) {
  const points = buildChartPoints(data);
  const isEmpty = points.length === 0 || points.every((point) => point.licenseExpirations === 0);

  return (
    <ChartPanel
      title="License expirations by month"
      description="Monthly count of foster-home licenses expiring statewide."
      summary={buildSummary(points)}
      isEmpty={isEmpty}
      emptyDescription="No license expiration history is available for the selected reporting period."
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-default)" vertical={false} />
          <XAxis
            dataKey="monthLabel"
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
          <Bar
            dataKey="licenseExpirations"
            name="License expirations"
            fill="var(--accent-brand)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
