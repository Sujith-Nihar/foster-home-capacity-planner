import { describe, expect, it } from "vitest";

import {
  buildDataSufficiencyReason,
  filterCountiesByComparisonStatus,
  getComparisonStatus,
  getSuggestedRecruitmentAttention,
  isLimitedDataCounty,
} from "@/lib/recruitment/classification";
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

describe("recruitment classification", () => {
  it("separates comparison status from suggested attention for eligible counties", () => {
    const county = sampleCounty({ recruitmentPriority: "High" });
    expect(getComparisonStatus(county)).toBe("Eligible");
    expect(getSuggestedRecruitmentAttention(county)).toBe("High");
    expect(isLimitedDataCounty(county)).toBe(false);
    expect(buildDataSufficiencyReason(county)).toBe("");
  });

  it("marks limited-data counties as not scored with a specific reason", () => {
    const county = sampleCounty({
      county: "Tiny",
      recruitmentPriority: "Limited data",
      currentFosterHomeChildren: 8,
      activeProviders: 2,
    });

    expect(getComparisonStatus(county)).toBe("Limited data");
    expect(getSuggestedRecruitmentAttention(county)).toBe("Not scored");
    expect(buildDataSufficiencyReason(county)).toContain("both comparison minimums are unmet");
  });

  it("explains unmet child minimum only", () => {
    const county = sampleCounty({
      recruitmentPriority: "Limited data",
      currentFosterHomeChildren: 8,
      activeProviders: 5,
    });

    expect(buildDataSufficiencyReason(county)).toContain("8 current foster-home children");
    expect(buildDataSufficiencyReason(county)).toContain("at least 10 are required");
  });

  it("explains unmet provider minimum only", () => {
    const county = sampleCounty({
      recruitmentPriority: "Limited data",
      currentFosterHomeChildren: 12,
      activeProviders: 2,
    });

    expect(buildDataSufficiencyReason(county)).toContain("2 engaged providers");
    expect(buildDataSufficiencyReason(county)).toContain("at least 3 are required");
  });

  it("filters counties by comparison status", () => {
    const counties = [
      sampleCounty({ county: "Cook", recruitmentPriority: "High" }),
      sampleCounty({ county: "Tiny", recruitmentPriority: "Limited data" }),
    ];

    expect(filterCountiesByComparisonStatus(counties, "eligible")).toHaveLength(1);
    expect(filterCountiesByComparisonStatus(counties, "limited")).toHaveLength(1);
    expect(filterCountiesByComparisonStatus(counties, "all")).toHaveLength(2);
  });
});
