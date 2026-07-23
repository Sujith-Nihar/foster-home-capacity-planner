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
import type { SystemSnapshotDto } from "@/lib/types/domain";
import { formatCount, formatPercent } from "@/lib/utils/formatters";

type PlacementTypeChartProps = {
  snapshot: SystemSnapshotDto;
};

const PLACEMENT_COLORS = {
  "Foster home": "var(--accent-brand)",
  Kin: "var(--status-medium-fg)",
  Nonfamily: "var(--text-tertiary)",
} as const;

type ChartPoint = {
  type: keyof typeof PLACEMENT_COLORS;
  count: number;
  share: number;
};

function buildChartPoints(snapshot: SystemSnapshotDto): ChartPoint[] {
  const total = snapshot.currentChildrenInCare;
  const items = [
    { type: "Foster home" as const, count: snapshot.currentFosterHomeChildren },
    { type: "Kin" as const, count: snapshot.currentKinChildren },
    { type: "Nonfamily" as const, count: snapshot.currentNonfamilyChildren },
  ];

  return items.map((item) => ({
    ...item,
    share: total > 0 ? item.count / total : 0,
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
      <p className="font-medium text-text-primary">{point.type}</p>
      <p className="text-text-secondary">Children: {formatCount(point.count)}</p>
      <p className="text-text-secondary">Share: {formatPercent(point.share)}</p>
    </div>
  );
}

function buildSummary(points: ChartPoint[], total: number): string {
  if (total === 0) {
    return "No children are currently in care at the reporting date.";
  }

  return points
    .map((point) => `${point.type}: ${formatCount(point.count)} (${formatPercent(point.share)})`)
    .join(". ")
    .concat(`. Total children in care: ${formatCount(total)}.`);
}

export function PlacementTypeChart({ snapshot }: PlacementTypeChartProps) {
  const points = buildChartPoints(snapshot);
  const total = snapshot.currentChildrenInCare;
  const isEmpty = total === 0;

  return (
    <ChartPanel
      title="Placement-type context"
      description="How current children in care are distributed across placement types."
      summary={buildSummary(points, total)}
      isEmpty={isEmpty}
      emptyDescription="No children in care are recorded at the reporting date."
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-default)" vertical={false} />
          <XAxis
            dataKey="type"
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
          <Bar dataKey="count" name="Children" radius={[4, 4, 0, 0]}>
            {points.map((point) => (
              <Cell key={point.type} fill={PLACEMENT_COLORS[point.type]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
