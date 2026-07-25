import { describe, expect, it } from "vitest";

import { mapRetentionExportRows } from "@/lib/data/exports";
import {
  buildRetentionPageHref,
  buildRetentionQueryString,
  sortRetentionProviders,
} from "@/lib/retention/query";
import type { ProviderMetricsDto } from "@/lib/types/domain";
import { MAX_EXPORT_ROWS, serializeCsv } from "@/lib/utils/csv";
import { parseRetentionSearchParams } from "@/lib/validation/search-params";

const sampleProvider = (overrides: Partial<ProviderMetricsDto> = {}): ProviderMetricsDto => ({
  providerId: 500001,
  county: "Cook",
  reportingDate: "2026-07-01",
  licenseStartDate: "2024-01-01",
  licenseEndDate: "2027-01-01",
  daysUntilExpiration: 180,
  currentlyHasPlacement: false,
  lastCompletedPlacementEnd: "2025-12-01",
  daysSinceLastPlacement: 212,
  totalActiveDays: 400,
  activeDaysLast365: 45,
  eligibleLicensedDaysLast365: 365,
  engagementRateLast365: 0.12,
  minAge: 0,
  maxAge: 17,
  outreachPriority: "High",
  outreachReasons: ["Inactive for at least 180 days"],
  ...overrides,
});

describe("retention filters and sorting", () => {
  it("parses expiration and inactivity filters from the URL", () => {
    expect(
      parseRetentionSearchParams({
        expiration: "within_30",
        minInactivityDays: "90",
        minAge: "6",
        maxAge: "12",
      }),
    ).toMatchObject({
      expiration: "within_30",
      minInactivityDays: 90,
      minAge: 6,
      maxAge: 12,
    });
  });

  it("sorts outreach priority with a fixed high-to-low order", () => {
    const providers = [
      sampleProvider({ providerId: 1, outreachPriority: "Low" }),
      sampleProvider({ providerId: 2, outreachPriority: "High" }),
      sampleProvider({ providerId: 3, outreachPriority: "Medium" }),
    ];

    const sorted = sortRetentionProviders(providers, "outreach_priority", "asc");
    expect(sorted.map((provider) => provider.providerId)).toEqual([2, 3, 1]);
  });

  it("builds retention query strings from active filters", () => {
    expect(
      buildRetentionQueryString({
        county: "Cook",
        priority: "High",
        activity: "inactive",
        expiration: "within_90",
        minInactivityDays: 60,
        sort: "days_until_expiration",
        direction: "asc",
        page: 2,
      }),
    ).toBe(
      "?county=Cook&priority=High&activity=inactive&expiration=within_90&minInactivityDays=60&page=2&sort=days_until_expiration&direction=asc",
    );
  });

  it("builds pagination links while preserving filters", () => {
    const searchParams = parseRetentionSearchParams({
      county: "Cook",
      priority: "High",
      page: "2",
    });

    expect(buildRetentionPageHref(searchParams, 3)).toBe(
      "/retention?county=Cook&priority=High&page=3&sort=outreach_priority&direction=asc",
    );
  });
});

describe("retention export", () => {
  it("serializes filtered export rows to CSV", () => {
    const csv = serializeCsv(mapRetentionExportRows([sampleProvider()]));
    expect(csv).toContain("provider_id,county,license_end_date");
    expect(csv).toContain("500001,Cook");
    expect(csv).toContain("High outreach priority");
    expect(csv).toContain("Inactive for 212 days");
  });

  it("serializes retention export rows to CSV", () => {
    const csv = serializeCsv(
      mapRetentionExportRows([
        {
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
          engagementRateLast365: 0.81,
          minAge: 0,
          maxAge: 8,
          outreachPriority: "High",
          outreachReasons: ["Inactive with license expiring within 90 days"],
        },
      ]),
    );
    expect(csv).toContain("provider_id,county,license_end_date");
    expect(csv).toContain("500021");
  });
});
