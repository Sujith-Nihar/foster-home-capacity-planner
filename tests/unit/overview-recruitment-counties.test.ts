import { describe, expect, it } from "vitest";

import {
  OVERVIEW_RECRUITMENT_COUNTY_LIMIT,
  selectOverviewRecruitmentCounties,
  sortOverviewRecruitmentCounties,
} from "@/lib/overview/recruitment-counties";
import type { CountyMetricsDto } from "@/lib/types/domain";

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
  recruitmentReasons: [],
  ...overrides,
});

describe("overview recruitment county ordering", () => {
  it("sorts by attention, then children per engaged provider, then foster-home children", () => {
    const sorted = sortOverviewRecruitmentCounties([
      sampleCounty({ county: "LowCounty", recruitmentPriority: "Low", childrenPerActiveProvider: 9 }),
      sampleCounty({ county: "MediumCounty", recruitmentPriority: "Medium", childrenPerActiveProvider: 8 }),
      sampleCounty({ county: "HighCounty", recruitmentPriority: "High", childrenPerActiveProvider: 3 }),
      sampleCounty({
        county: "HighPressure",
        recruitmentPriority: "High",
        childrenPerActiveProvider: 7,
        currentFosterHomeChildren: 120,
      }),
      sampleCounty({
        county: "HighSmaller",
        recruitmentPriority: "High",
        childrenPerActiveProvider: 7,
        currentFosterHomeChildren: 90,
      }),
      sampleCounty({ county: "Limited", recruitmentPriority: "Limited data" }),
    ]);

    expect(sorted.map((county) => county.county)).toEqual([
      "HighPressure",
      "HighSmaller",
      "HighCounty",
      "MediumCounty",
      "LowCounty",
    ]);
  });

  it("returns only five counties for the overview table", () => {
    const counties = selectOverviewRecruitmentCounties(
      Array.from({ length: 12 }, (_, index) =>
        sampleCounty({
          county: `County${index}`,
          recruitmentPriority: index < 6 ? "High" : "Medium",
          childrenPerActiveProvider: 12 - index,
        }),
      ),
    );

    expect(counties).toHaveLength(OVERVIEW_RECRUITMENT_COUNTY_LIMIT);
    expect(counties.every((county) => county.recruitmentPriority === "High")).toBe(true);
  });
});
