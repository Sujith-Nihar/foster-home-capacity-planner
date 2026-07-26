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

import { OverviewChartPanel } from "@/components/overview/overview-chart-panel";
import { REPORTING_DATE } from "@/config/metrics";
import type { MonthlyMetricsDto, RetentionSummaryDto } from "@/lib/types/domain";
import { formatCount, formatMonthLabel } from "@/lib/utils/formatters";

type OverviewUpcomingLicensesChartProps = {
  monthlyMetrics: MonthlyMetricsDto[];
  retentionSummary: RetentionSummaryDto;
};

type ChartPoint = {
  label: string;
  count: number;
};

function buildUpcomingMonthlyPoints(monthlyMetrics: MonthlyMetricsDto[]): ChartPoint[] {
  return monthlyMetrics
    .filter((item) => item.month > REPORTING_DATE)
    .map((item) => ({
      label: formatMonthLabel(item.month),
      count: item.licenseExpirations,
    }));
}

function buildExposureWindowPoints(retentionSummary: RetentionSummaryDto): ChartPoint[] {
  return [
    {
      label: "Within 90 days",
      count: retentionSummary.licensesExpiringWithin90Days,
    },
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
      <p className="font-medium text-text-primary">{point.label}</p>
      <p className="text-text-secondary">Licenses ending: {formatCount(point.count)}</p>
    </div>
  );
}

export function OverviewUpcomingLicensesChart({
  monthlyMetrics,
  retentionSummary,
}: OverviewUpcomingLicensesChartProps) {
  const upcomingMonthly = buildUpcomingMonthlyPoints(monthlyMetrics);
  const usesMonthlyOutlook = upcomingMonthly.length > 0;
  const points = usesMonthlyOutlook ? upcomingMonthly : buildExposureWindowPoints(retentionSummary);
  const isEmpty = points.length === 0 || points.every((point) => point.count === 0);

  const peak = points.reduce(
    (max, point) => (point.count > max.count ? point : max),
    points[0] ?? { label: "", count: 0 },
  );

  const takeaway = usesMonthlyOutlook
    ? `The largest upcoming license-expiration month is ${peak.label} with ${formatCount(peak.count)} licenses ending.`
    : `${formatCount(retentionSummary.licensesExpiringWithin90Days)} licensed providers have licenses ending within 90 days after the reporting date.`;

  const detailedSummary = usesMonthlyOutlook
    ? points
        .map((point) => `${point.label}: ${formatCount(point.count)} license expirations`)
        .join(". ")
        .concat(".")
    : `${formatCount(retentionSummary.licensesExpiringWithin90Days)} provider licenses end within 90 days after ${REPORTING_DATE}.`;

  return (
    <OverviewChartPanel
      title="Upcoming license expirations"
      description="Licensed foster homes approaching their license end date after the reporting date."
      takeaway={takeaway}
      detailedSummary={detailedSummary}
      isEmpty={isEmpty}
      emptyDescription="No upcoming license expiration counts are available for the reporting date."
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-default)" vertical={false} />
          <XAxis
            dataKey="label"
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
          <Bar
            dataKey="count"
            name="License expirations"
            fill="var(--accent-brand)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </OverviewChartPanel>
  );
}
