import { describe, expect, it } from "vitest";

import {
  buildProviderOutreachFactorStatements,
  buildOutreachPrioritySummary,
  buildProviderFlagNarrativeSummary,
  formatStaffFacingTriggeredRule,
} from "@/lib/providers/outreach-factors";
import type { ProviderMetricsDto } from "@/lib/types/domain";

const sampleProvider = (overrides: Partial<ProviderMetricsDto> = {}): ProviderMetricsDto => ({
  providerId: 500021,
  county: "Adams",
  reportingDate: "2026-07-01",
  licenseStartDate: "2021-07-01",
  licenseEndDate: "2026-07-15",
  daysUntilExpiration: 14,
  currentlyHasPlacement: false,
  lastCompletedPlacementEnd: "2026-04-25",
  daysSinceLastPlacement: 67,
  totalActiveDays: 1575,
  activeDaysLast365: 298,
  eligibleLicensedDaysLast365: 365,
  engagementRateLast365: 0.8164383561643835,
  minAge: 0,
  maxAge: 8,
  outreachPriority: "High",
  outreachReasons: [
    "Inactive with license expiring within 90 days and inactive for at least 60 days",
  ],
  ...overrides,
});

describe("buildProviderOutreachFactorStatements", () => {
  it("returns separate placement and license statements", () => {
    expect(buildProviderOutreachFactorStatements(sampleProvider())).toEqual([
      "No current foster-home placement for 67 days.",
      "License ends in 14 days.",
    ]);
  });

  it("uses singular day grammar", () => {
    expect(
      buildProviderOutreachFactorStatements(
        sampleProvider({ daysUntilExpiration: 1, daysSinceLastPlacement: 1 }),
      ),
    ).toEqual([
      "No current foster-home placement for 1 day.",
      "License ends in 1 day.",
    ]);
  });
});

describe("buildOutreachPrioritySummary", () => {
  it("describes the provider outreach priority dynamically", () => {
    expect(buildOutreachPrioritySummary("High")).toBe(
      "These conditions meet the High outreach rule.",
    );
  });
});

describe("buildProviderFlagNarrativeSummary", () => {
  it("builds a plain-language flag summary with a planning disclaimer", () => {
    expect(buildProviderFlagNarrativeSummary(sampleProvider())).toBe(
      "This provider is flagged for staff review because it currently has no active foster-home placement and its license expires in 14 days. This is a planning signal for follow-up, not a prediction of provider closure or non-renewal.",
    );
  });

  it("returns null when no outreach signals are present", () => {
    expect(
      buildProviderFlagNarrativeSummary(
        sampleProvider({
          outreachPriority: "Low",
          outreachReasons: ["No elevated outreach signals at the reporting date"],
        }),
      ),
    ).toBeNull();
  });
});

describe("formatStaffFacingTriggeredRule", () => {
  it("maps internal rules to staff-facing wording", () => {
    expect(
      formatStaffFacingTriggeredRule(
        "Inactive for at least 60 days with a license ending within 90 days",
      ),
    ).toBe("No current placement for at least 60 days and license ending within 90 days.");
  });
});
