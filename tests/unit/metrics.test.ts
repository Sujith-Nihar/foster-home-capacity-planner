import { describe, expect, it } from "vitest";

import {
  AGE_GROUPS,
  COUNTY_NORMALIZATION_MAP,
  RECRUITMENT_MINIMUM_VOLUME,
  RECENT_WINDOW_START,
  REPORTING_DATE,
  RETENTION_THRESHOLDS,
} from "@/config/metrics";

describe("metrics config", () => {
  it("exposes fixed reporting and recent-window dates", () => {
    expect(REPORTING_DATE).toBe("2026-07-01");
    expect(RECENT_WINDOW_START).toBe("2025-07-01");
  });

  it("defines the four documented age groups", () => {
    expect(AGE_GROUPS.map((group) => group.label)).toEqual([
      "0–5",
      "6–12",
      "13–17",
      "Unknown",
    ]);
  });

  it("defines the documented county normalization map", () => {
    expect(COUNTY_NORMALIZATION_MAP).toEqual({
      Vermillion: "Vermilion",
      "De Witt": "DeWitt",
    });
  });

  it("defines recruitment minimum-volume rules", () => {
    expect(RECRUITMENT_MINIMUM_VOLUME).toEqual({
      currentFosterHomeChildren: 10,
      activeProviders: 3,
    });
  });

  it("defines retention outreach thresholds", () => {
    expect(RETENTION_THRESHOLDS.highInactivityDays).toBe(180);
    expect(RETENTION_THRESHOLDS.highEngagementRateMax).toBe(0.1);
    expect(RETENTION_THRESHOLDS.mediumEngagementRateMax).toBe(0.25);
    expect(RETENTION_THRESHOLDS.minEligibleLicensedDays).toBe(90);
  });
});
