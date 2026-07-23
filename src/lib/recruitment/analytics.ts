import type { AgeGroupLabel } from "@/config/metrics";
import type { CountyMetricsDto } from "@/lib/types/domain";

export type AgeGroupPressureDto = {
  ageGroup: AgeGroupLabel;
  fosterChildren: number;
  matchingActiveProviders: number;
  childrenPerMatchingActiveProvider: number | null;
};

export function aggregateAgeGroupPressure(
  rows: Array<{
    ageGroup: AgeGroupLabel;
    currentFosterHomeChildren: number;
    matchingActiveProviders: number;
    childrenPerMatchingActiveProvider: number | null;
  }>,
): AgeGroupPressureDto[] {
  const totals = new Map<AgeGroupLabel, AgeGroupPressureDto>();

  for (const row of rows) {
    const existing = totals.get(row.ageGroup);
    if (!existing) {
      totals.set(row.ageGroup, {
        ageGroup: row.ageGroup,
        fosterChildren: row.currentFosterHomeChildren,
        matchingActiveProviders: row.matchingActiveProviders,
        childrenPerMatchingActiveProvider: null,
      });
      continue;
    }

    existing.fosterChildren += row.currentFosterHomeChildren;
    existing.matchingActiveProviders += row.matchingActiveProviders;
  }

  return Array.from(totals.values())
    .map((item) => ({
      ...item,
      childrenPerMatchingActiveProvider:
        item.matchingActiveProviders > 0
          ? item.fosterChildren / item.matchingActiveProviders
          : null,
    }))
    .sort((left, right) => {
      const leftValue = left.childrenPerMatchingActiveProvider ?? -1;
      const rightValue = right.childrenPerMatchingActiveProvider ?? -1;
      return rightValue - leftValue;
    });
}

export function scatterPlotCounties(counties: CountyMetricsDto[]): CountyMetricsDto[] {
  return counties.filter(
    (county) =>
      county.recruitmentPriority !== "Limited data" &&
      county.childrenPerActiveProvider !== null &&
      county.outOfCountyFosterRate !== null &&
      county.currentFosterHomeChildren > 0,
  );
}

export function partitionRecruitmentCounties(counties: CountyMetricsDto[]): {
  eligible: CountyMetricsDto[];
  limitedData: CountyMetricsDto[];
} {
  const eligible: CountyMetricsDto[] = [];
  const limitedData: CountyMetricsDto[] = [];

  for (const county of counties) {
    if (county.recruitmentPriority === "Limited data") {
      limitedData.push(county);
    } else {
      eligible.push(county);
    }
  }

  return { eligible, limitedData };
}
