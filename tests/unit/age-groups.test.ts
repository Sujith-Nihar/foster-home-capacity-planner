import { describe, expect, it } from "vitest";

import {
  buildAgeGroupPrioritySummary,
  buildMeasurableAgeGroupRows,
  computeStatewideAgeGroupBenchmarks,
  findHighestNeedAgeGroup,
} from "@/lib/recruitment/age-groups";
import type { CountyAgeMetricsDto } from "@/lib/types/domain";

function ageMetric(
  county: string,
  ageGroup: CountyAgeMetricsDto["ageGroup"],
  children: number,
  activeProviders: number,
  ratio: number | null,
): CountyAgeMetricsDto {
  return {
    county,
    ageGroup,
    reportingDate: "2026-07-01",
    currentFosterHomeChildren: children,
    matchingLicensedProviders: activeProviders + 5,
    matchingActiveProviders: activeProviders,
    childrenPerMatchingActiveProvider: ratio,
  };
}

describe("age-group recruitment helpers", () => {
  it("shows all three measurable age groups for every county", () => {
    const rows = buildMeasurableAgeGroupRows([
      ageMetric("Cook", "6–12", 434, 103, 4.21),
    ]);

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.ageGroup)).toEqual(["0–5", "6–12", "13–17"]);
    expect(rows[0]).toMatchObject({
      ageGroup: "0–5",
      currentFosterHomeChildren: 0,
      matchingActiveProviders: 0,
      childrenPerMatchingActiveProvider: null,
    });
    expect(rows[1]).toMatchObject({
      ageGroup: "6–12",
      currentFosterHomeChildren: 434,
      matchingActiveProviders: 103,
      childrenPerMatchingActiveProvider: 4.21,
    });
  });

  it("highlights the age group with the highest children-per-matching-provider ratio", () => {
    const rows = buildMeasurableAgeGroupRows([
      ageMetric("Sample", "0–5", 248, 99, 2.51),
      ageMetric("Sample", "6–12", 434, 103, 4.21),
      ageMetric("Sample", "13–17", 361, 49, 7.37),
    ]);

    expect(findHighestNeedAgeGroup(rows)).toBe("13–17");
  });

  it("identifies different highest-need groups across counties", () => {
    const cook = buildMeasurableAgeGroupRows([
      ageMetric("Cook", "0–5", 100, 50, 2),
      ageMetric("Cook", "6–12", 200, 40, 5),
      ageMetric("Cook", "13–17", 150, 30, 5),
    ]);
    const sangamon = buildMeasurableAgeGroupRows([
      ageMetric("Sangamon", "0–5", 80, 20, 4),
      ageMetric("Sangamon", "6–12", 60, 30, 2),
      ageMetric("Sangamon", "13–17", 40, 20, 2),
    ]);

    expect(findHighestNeedAgeGroup(cook)).toBe("6–12");
    expect(findHighestNeedAgeGroup(sangamon)).toBe("0–5");
  });

  it("builds a plain-language summary for multiple elevated age groups", () => {
    const countyAgeGroups = [
      ageMetric("Cook", "0–5", 248, 99, 2),
      ageMetric("Cook", "6–12", 434, 103, 4.21),
      ageMetric("Cook", "13–17", 361, 49, 7.37),
    ];
    const statewide = [
      ageMetric("A", "0–5", 0, 0, 2),
      ageMetric("B", "0–5", 0, 0, 2.5),
      ageMetric("A", "6–12", 0, 0, 3),
      ageMetric("B", "6–12", 0, 0, 3.5),
      ageMetric("A", "13–17", 0, 0, 5),
      ageMetric("B", "13–17", 0, 0, 6),
    ];
    const benchmarks = computeStatewideAgeGroupBenchmarks(statewide);

    const summary = buildAgeGroupPrioritySummary(countyAgeGroups, benchmarks);

    expect(summary).toContain("Recruitment attention is highest for ages 13–17.");
    expect(summary).toContain("Ages 6–12 also have more children per matching provider than the statewide median.");
  });

  it("computes statewide median and 75th percentile by age group", () => {
    const statewide = [
      ageMetric("A", "13–17", 0, 0, 4),
      ageMetric("B", "13–17", 0, 0, 6),
      ageMetric("C", "13–17", 0, 0, 8),
      ageMetric("D", "13–17", 0, 0, 10),
    ];
    const benchmarks = computeStatewideAgeGroupBenchmarks(statewide);
    const teenBenchmark = benchmarks.find((item) => item.ageGroup === "13–17");

    expect(teenBenchmark?.median).toBe(7);
    expect(teenBenchmark?.p75).toBe(8.5);
  });
});
