import { describe, expect, it } from "vitest";

import {
  buildOverviewAttentionBullets,
  buildOverviewInsights,
} from "@/lib/data/overview";

const baseSnapshot = {
  reportingDate: "2026-07-01",
  currentChildrenInCare: 8071,
  currentFosterHomeChildren: 4343,
  currentKinChildren: 3688,
  currentNonfamilyChildren: 40,
  currentlyLicensedProviders: 3391,
  currentlyActiveProviders: 2733,
  highRecruitmentCounties: 10,
  highRetentionProviders: 448,
};

const baseRetentionDistribution = {
  high: 448,
  medium: 1089,
  low: 1854,
};

describe("overview insight selection", () => {
  it("includes the county pressure bullet only when a ranked ratio is available", () => {
    const withRatio = buildOverviewAttentionBullets({
      snapshot: baseSnapshot,
      topRecruitmentCounties: [
        {
          county: "Cook",
          childrenPerActiveProvider: 2.4,
          recruitmentPriority: "High",
        },
      ],
      retentionDistribution: baseRetentionDistribution,
    });

    const withoutRatio = buildOverviewAttentionBullets({
      snapshot: baseSnapshot,
      topRecruitmentCounties: [
        {
          county: "Cook",
          childrenPerActiveProvider: null,
          recruitmentPriority: "High",
        },
      ],
      retentionDistribution: baseRetentionDistribution,
    });

    expect(withRatio).toHaveLength(4);
    expect(withRatio[3]).toContain("Cook County");
    expect(withoutRatio).toHaveLength(3);
    expect(withoutRatio.some((bullet) => bullet.includes("Cook County"))).toBe(false);
  });

  it("omits the county pressure bullet when no ranked counties are returned", () => {
    const bullets = buildOverviewAttentionBullets({
      snapshot: baseSnapshot,
      topRecruitmentCounties: [],
      retentionDistribution: baseRetentionDistribution,
    });

    expect(bullets).toHaveLength(3);
  });

  it("builds a zero-share headline when no children are in care", () => {
    const insights = buildOverviewInsights({
      snapshot: {
        ...baseSnapshot,
        currentChildrenInCare: 0,
        currentFosterHomeChildren: 0,
        currentKinChildren: 0,
        currentNonfamilyChildren: 0,
      },
      topRecruitmentCounties: [],
      retentionDistribution: {
        high: 0,
        medium: 0,
        low: 0,
      },
    });

    expect(insights.headline).toContain("0.0%");
    expect(insights.bullets[0]).toContain("0");
  });

  it("keeps deterministic placement and priority sentences for the baseline snapshot", () => {
    const insights = buildOverviewInsights({
      snapshot: baseSnapshot,
      topRecruitmentCounties: [
        {
          county: "Cook",
          childrenPerActiveProvider: 2.4,
          recruitmentPriority: "High",
        },
      ],
      retentionDistribution: baseRetentionDistribution,
    });

    expect(insights.headline).toContain("53.8%");
    expect(insights.bullets[0]).toContain("4,343");
    expect(insights.bullets[1]).toContain("10 counties");
    expect(insights.bullets[2]).toContain("448 providers");
    expect(insights.bullets[3]).toContain("Cook County");
  });
});
