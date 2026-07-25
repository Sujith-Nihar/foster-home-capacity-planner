import { describe, expect, it } from "vitest";

import { buildOverviewInsights } from "@/lib/data/overview";
import {
  formatBooleanLabel,
  formatCount,
  formatNullablePercent,
  formatRecruitmentPriorityLabel,
  formatReportingDate,
} from "@/lib/utils/formatters";

describe("formatters", () => {
  it("formats reporting dates for display", () => {
    expect(formatReportingDate("2026-07-01")).toBe("July 1, 2026");
  });

  it("formats counts with grouping separators", () => {
    expect(formatCount(4343)).toBe("4,343");
  });

  it("formats nullable percentages", () => {
    expect(formatNullablePercent(0.6246575342)).toBe("62.5%");
    expect(formatNullablePercent(null)).toBe("—");
  });

  it("formats recruitment priority labels", () => {
    expect(formatRecruitmentPriorityLabel("High")).toBe("High recruitment attention");
    expect(formatRecruitmentPriorityLabel("Limited data")).toBe("Not scored");
  });

  it("formats boolean labels", () => {
    expect(formatBooleanLabel(true, "Active", "Inactive")).toBe("Active");
    expect(formatBooleanLabel(false, "Active", "Inactive")).toBe("Inactive");
  });
});

describe("overview insights", () => {
  it("builds deterministic insight copy from snapshot metrics", () => {
    const insights = buildOverviewInsights({
      snapshot: {
        reportingDate: "2026-07-01",
        currentChildrenInCare: 8071,
        currentFosterHomeChildren: 4343,
        currentKinChildren: 3688,
        currentNonfamilyChildren: 40,
        currentlyLicensedProviders: 3391,
        currentlyActiveProviders: 2733,
        highRecruitmentCounties: 10,
        highRetentionProviders: 448,
      },
      topRecruitmentCounties: [
        {
          county: "Cook",
          childrenPerActiveProvider: 2.4,
          recruitmentPriority: "High",
        },
      ],
      retentionDistribution: {
        high: 448,
        medium: 1089,
        low: 1854,
      },
    });

    expect(insights.headline).toContain("53.8%");
    expect(insights.bullets[0]).toContain("4,343");
    expect(insights.bullets[1]).toContain("10 counties");
    expect(insights.bullets[2]).toContain("448 providers");
    expect(insights.bullets[3]).toContain("Cook County");
  });
});
