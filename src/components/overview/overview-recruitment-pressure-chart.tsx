"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { OverviewChartPanel } from "@/components/overview/overview-chart-panel";
import { scatterPlotCounties } from "@/lib/recruitment/analytics";
import type { CountyMetricsDto } from "@/lib/types/domain";
import {
  formatCount,
  formatCountyName,
  formatNullablePercent,
  formatRatio,
} from "@/lib/utils/formatters";

type OverviewRecruitmentPressureChartProps = {
  counties: CountyMetricsDto[];
};

type ScatterPoint = {
  county: string;
  x: number;
  y: number;
  z: number;
};

function buildPoints(counties: CountyMetricsDto[]): ScatterPoint[] {
  return scatterPlotCounties(counties).map((county) => ({
    county: county.county,
    x: county.childrenPerActiveProvider ?? 0,
    y: county.outOfCountyFosterRate ?? 0,
    z: county.currentFosterHomeChildren,
  }));
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ScatterPoint }>;
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-text-primary">{formatCountyName(point.county)}</p>
      <p className="text-text-secondary">
        Children per engaged provider: {formatRatio(point.x)}
      </p>
      <p className="text-text-secondary">Out-of-county rate: {formatNullablePercent(point.y)}</p>
      <p className="text-text-secondary">Foster-home children: {formatCount(point.z)}</p>
    </div>
  );
}

export function OverviewRecruitmentPressureChart({
  counties,
}: OverviewRecruitmentPressureChartProps) {
  const points = buildPoints(counties);
  const isEmpty = points.length === 0;
  const highestPressure = [...points].sort((left, right) => right.x - left.x)[0];

  const takeaway = highestPressure
    ? `${formatCountyName(highestPressure.county)} shows the highest children-per-engaged-provider ratio among comparable counties on this chart.`
    : "Eligible counties need comparable provider and placement metrics before recruitment pressure can be compared.";

  const detailedSummary = isEmpty
    ? "No eligible counties are available for recruitment pressure comparison."
    : `Scatter plot of ${formatCount(points.length)} eligible counties. Bubble size reflects foster-home children. Higher values to the right indicate more children per engaged provider; higher values upward indicate greater out-of-county placement rates.`;

  return (
    <OverviewChartPanel
      title="County recruitment pressure"
      description="Eligible counties compared by children per engaged provider and out-of-county placement rate."
      takeaway={takeaway}
      detailedSummary={detailedSummary}
      isEmpty={isEmpty}
      emptyDescription="Eligible counties need comparable provider and out-of-county rate metrics to appear in this chart."
    >
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--border-default)" />
          <XAxis
            type="number"
            dataKey="x"
            name="Children per engaged provider"
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            tickFormatter={(value: number) => formatRatio(value)}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Out-of-county rate"
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            tickFormatter={(value: number) => formatNullablePercent(value)}
          />
          <ZAxis type="number" dataKey="z" range={[40, 400]} name="Foster-home children" />
          <Tooltip content={<ChartTooltip />} />
          <Scatter data={points} fill="var(--accent-brand)" name="County" />
        </ScatterChart>
      </ResponsiveContainer>
    </OverviewChartPanel>
  );
}
