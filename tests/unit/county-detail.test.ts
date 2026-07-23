import { describe, expect, it } from "vitest";

import {
  buildCountyLimitations,
  buildCountyPriorityExplanation,
  orderCountyAgeGroups,
} from "@/lib/recruitment/county-detail";
import { normalizeRouteCounty } from "@/lib/navigation/counties";
import type { CountyAgeMetricsDto, CountyMetricsDto } from "@/lib/types/domain";

const sampleCounty = (overrides: Partial<CountyMetricsDto> = {}): CountyMetricsDto => ({
  county: "Cook",
  reportingDate: "2026-07-01",
  currentChildrenInCare: 100,
  currentFosterHomeChildren: 80,
  currentKinChildren: 15,
  currentNonfamilyChildren: 5,
  licensedProviders: 40,
  activeProviders: 20,
  inactiveProviders: 5,
  childrenPerActiveProvider: 4,
  outOfCountyFosterCount: 10,
  outOfCountyFosterRate: 0.125,
  expiring90Days: 3,
  expiring180Days: 6,
  highRetentionProviders: 2,
  mediumRetentionProviders: 4,
  highestPressureAgeGroup: "6–12",
  recruitmentPriority: "High",
  recruitmentReasons: ["Above the 75th percentile statewide for children per active provider"],
  ...overrides,
});

describe("normalizeRouteCounty", () => {
  it("decodes and preserves valid county names", () => {
    expect(normalizeRouteCounty("Cook")).toBe("Cook");
    expect(normalizeRouteCounty("St.%20Clair")).toBe("St. Clair");
  });

  it("applies documented county normalization aliases", () => {
    expect(normalizeRouteCounty("Vermillion")).toBe("Vermilion");
    expect(normalizeRouteCounty("De%20Witt")).toBe("DeWitt");
  });

  it("rejects unsafe or empty route values", () => {
    expect(normalizeRouteCounty("")).toBeNull();
    expect(normalizeRouteCounty("%")).toBeNull();
    expect(normalizeRouteCounty("../Cook")).toBeNull();
    expect(normalizeRouteCounty("<script>")).toBeNull();
  });
});

describe("county detail helpers", () => {
  it("builds a plain-language explanation for eligible counties", () => {
    const explanation = buildCountyPriorityExplanation(sampleCounty());
    expect(explanation).toContain("Cook County");
    expect(explanation).toContain("High planning priority");
    expect(explanation).toContain("Above the 75th percentile");
  });

  it("builds a separate explanation for limited-data counties", () => {
    const explanation = buildCountyPriorityExplanation(
      sampleCounty({ recruitmentPriority: "Limited data", recruitmentReasons: [] }),
    );
    expect(explanation).toContain("does not meet minimum volume rules");
    expect(explanation).not.toContain("proven shortage");
  });

  it("orders age groups with Unknown shown last", () => {
    const ordered = orderCountyAgeGroups([
      {
        county: "Cook",
        ageGroup: "Unknown",
        reportingDate: "2026-07-01",
        currentFosterHomeChildren: 1,
        matchingLicensedProviders: 1,
        matchingActiveProviders: 1,
        childrenPerMatchingActiveProvider: 1,
      },
      {
        county: "Cook",
        ageGroup: "0–5",
        reportingDate: "2026-07-01",
        currentFosterHomeChildren: 2,
        matchingLicensedProviders: 2,
        matchingActiveProviders: 2,
        childrenPerMatchingActiveProvider: 1,
      },
    ] as CountyAgeMetricsDto[]);

    expect(ordered.map((group) => group.ageGroup)).toEqual(["0–5", "Unknown"]);
  });

  it("includes interpretation limitations", () => {
    const limitations = buildCountyLimitations(sampleCounty());
    expect(limitations.some((item) => item.includes("not available beds"))).toBe(true);
    expect(limitations.some((item) => item.includes("child identifiers"))).toBe(true);
  });
});
