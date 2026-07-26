import { describe, expect, it } from "vitest";

import { parseProviderRouteId } from "@/lib/navigation/providers";
import {
  buildProviderActivitySummary,
  buildProviderReviewSummary,
} from "@/lib/providers/detail";
import {
  buildProviderPreferenceContext,
  formatPreferredAgeRangeLabel,
} from "@/lib/providers/preference-context";
import type { ProviderActivityPeriodDto, ProviderMetricsDto } from "@/lib/types/domain";

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

const samplePeriod = (
  overrides: Partial<ProviderActivityPeriodDto> = {},
): ProviderActivityPeriodDto => ({
  providerId: 500001,
  periodStart: "2024-05-15",
  periodEnd: "2024-12-22",
  activeDays: 221,
  isCurrent: false,
  ...overrides,
});

describe("provider route parsing", () => {
  it("accepts positive integer provider ids", () => {
    expect(parseProviderRouteId("500021")).toBe(500021);
  });

  it("rejects invalid provider id formats", () => {
    expect(parseProviderRouteId("abc")).toBeNull();
    expect(parseProviderRouteId("0")).toBeNull();
    expect(parseProviderRouteId("-5")).toBeNull();
    expect(parseProviderRouteId("500021abc")).toBeNull();
  });
});

describe("provider preference context", () => {
  it("formats the preferred age range label", () => {
    expect(formatPreferredAgeRangeLabel(0, 8)).toBe("Ages 0–8");
  });

  it("returns alignment context only when preferences overlap county pressure", () => {
    const provider = sampleProvider({ minAge: 6, maxAge: 18 });
    expect(buildProviderPreferenceContext(provider, "13–17")).toContain(
      "Overlaps Adams County's highest-pressure age group: Ages 13–17.",
    );
    expect(buildProviderPreferenceContext(provider, "0–5")).toBeNull();
    expect(buildProviderPreferenceContext(provider, null)).toBeNull();
  });
});

describe("provider review summary", () => {
  it("builds a deterministic staff review summary from provider metrics", () => {
    const summary = buildProviderReviewSummary(sampleProvider());

    expect(summary).toContain("Provider 500021 in Adams County");
    expect(summary).toContain("does not currently have a foster-home placement");
    expect(summary).toContain("Ages 0–8");
    expect(summary).toContain("67 days ago");
    expect(summary).toContain("High");
    expect(summary).toContain(
      "Inactive with license expiring within 90 days and inactive for at least 60 days",
    );
  });

  it("handles providers without a completed placement end date", () => {
    const summary = buildProviderReviewSummary(
      sampleProvider({
        daysSinceLastPlacement: null,
        lastCompletedPlacementEnd: null,
        currentlyHasPlacement: true,
      }),
    );

    expect(summary).toContain("Days since last placement are not available");
    expect(summary).toContain("currently has a foster-home placement");
  });
});

describe("provider activity summary", () => {
  it("describes merged activity periods in plain language", () => {
    const summary = buildProviderActivitySummary([
      samplePeriod(),
      samplePeriod({
        periodStart: "2025-11-15",
        periodEnd: "2026-07-01",
        activeDays: 228,
        isCurrent: true,
      }),
    ]);

    expect(summary).toContain("221 active days");
  });

  it("returns an empty-state message when no periods exist", () => {
    expect(buildProviderActivitySummary([])).toContain("No foster-home placement activity periods");
  });
});
