import type { AgeGroupLabel } from "@/config/metrics";
import type { CountyAgeMetricsDto } from "@/lib/types/domain";
import { formatCount, formatRatio } from "@/lib/utils/formatters";

export const MEASURABLE_AGE_GROUP_LABELS = ["0–5", "6–12", "13–17"] as const satisfies readonly AgeGroupLabel[];

export type MeasurableAgeGroupLabel = (typeof MEASURABLE_AGE_GROUP_LABELS)[number];

export type AgeGroupRecruitmentRow = {
  ageGroup: MeasurableAgeGroupLabel;
  currentFosterHomeChildren: number;
  matchingActiveProviders: number;
  childrenPerMatchingActiveProvider: number | null;
};

export type StatewideAgeGroupBenchmark = {
  ageGroup: MeasurableAgeGroupLabel;
  median: number | null;
  p75: number | null;
};

function percentile(sortedValues: number[], percentileValue: number): number {
  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const index = (percentileValue / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedValues[lower];
  }

  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower);
}

export function buildMeasurableAgeGroupRows(
  ageGroups: CountyAgeMetricsDto[],
): AgeGroupRecruitmentRow[] {
  const byLabel = new Map(ageGroups.map((group) => [group.ageGroup, group]));

  return MEASURABLE_AGE_GROUP_LABELS.map((label) => {
    const group = byLabel.get(label);

    return {
      ageGroup: label,
      currentFosterHomeChildren: group?.currentFosterHomeChildren ?? 0,
      matchingActiveProviders: group?.matchingActiveProviders ?? 0,
      childrenPerMatchingActiveProvider: group?.childrenPerMatchingActiveProvider ?? null,
    };
  });
}

export function findHighestNeedAgeGroup(
  rows: AgeGroupRecruitmentRow[],
): MeasurableAgeGroupLabel | null {
  let highest: AgeGroupRecruitmentRow | null = null;

  for (const row of rows) {
    if (row.childrenPerMatchingActiveProvider === null) {
      continue;
    }

    if (
      !highest ||
      row.childrenPerMatchingActiveProvider > (highest.childrenPerMatchingActiveProvider ?? -1)
    ) {
      highest = row;
    }
  }

  return highest?.ageGroup ?? null;
}

export function computeStatewideAgeGroupBenchmarks(
  ageGroups: CountyAgeMetricsDto[],
): StatewideAgeGroupBenchmark[] {
  return MEASURABLE_AGE_GROUP_LABELS.map((label) => {
    const values = ageGroups
      .filter((group) => group.ageGroup === label)
      .map((group) => group.childrenPerMatchingActiveProvider)
      .filter((value): value is number => value !== null);

    if (values.length === 0) {
      return { ageGroup: label, median: null, p75: null };
    }

    const sorted = [...values].sort((left, right) => left - right);

    return {
      ageGroup: label,
      median: percentile(sorted, 50),
      p75: percentile(sorted, 75),
    };
  });
}

export function groupCountyAgeMetricsByCounty(
  ageGroups: CountyAgeMetricsDto[],
): Map<string, CountyAgeMetricsDto[]> {
  const grouped = new Map<string, CountyAgeMetricsDto[]>();

  for (const group of ageGroups) {
    const existing = grouped.get(group.county) ?? [];
    existing.push(group);
    grouped.set(group.county, existing);
  }

  return grouped;
}

export function formatAgeGroupRatioDescription(ratio: number | null): string {
  if (ratio === null) {
    return "Ratio unavailable when no active providers with matching current preferences are recorded.";
  }

  return `${formatRatio(ratio)} children per active provider whose current preferences include this age group.`;
}

export function formatAgeGroupCountDescription(row: AgeGroupRecruitmentRow): string {
  return `${formatCount(row.currentFosterHomeChildren)} children and ${formatCount(row.matchingActiveProviders)} active providers with matching current preferences for ages ${row.ageGroup}.`;
}

export function buildAgeGroupPrioritySummary(
  ageGroups: CountyAgeMetricsDto[],
  benchmarks: StatewideAgeGroupBenchmark[],
): string | null {
  const rows = buildMeasurableAgeGroupRows(ageGroups);
  const highestNeed = findHighestNeedAgeGroup(rows);

  if (!highestNeed) {
    return null;
  }

  const benchmarkByLabel = new Map(benchmarks.map((item) => [item.ageGroup, item]));
  const alsoElevated = rows
    .filter((row) => row.ageGroup !== highestNeed)
    .filter((row) => {
      const benchmark = benchmarkByLabel.get(row.ageGroup);
      const median = benchmark?.median;

      return (
        row.childrenPerMatchingActiveProvider !== null &&
        median !== null &&
        median !== undefined &&
        row.childrenPerMatchingActiveProvider >= median
      );
    })
    .map((row) => `ages ${row.ageGroup}`);

  let summary = `Recruitment attention is highest for ages ${highestNeed}.`;

  if (alsoElevated.length > 0) {
    const joined =
      alsoElevated.length === 1
        ? alsoElevated[0]
        : `${alsoElevated.slice(0, -1).join(", ")} and ${alsoElevated.at(-1)}`;
    summary += ` ${joined.charAt(0).toUpperCase()}${joined.slice(1)} also have more children per matching provider than the statewide median.`;
  }

  return summary;
}
