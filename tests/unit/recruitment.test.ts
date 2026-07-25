import { describe, expect, it } from "vitest";

import { mapRecruitmentExportRows } from "@/lib/data/exports";
import { partitionRecruitmentCounties } from "@/lib/recruitment/analytics";
import { sortRecruitmentCounties } from "@/lib/recruitment/query";
import type { CountyMetricsDto } from "@/lib/types/domain";
import { MAX_EXPORT_ROWS, sanitizeExportFilename, serializeCsv } from "@/lib/utils/csv";
import { parseRecruitmentSearchParams, safeParseRecruitmentSearchParams } from "@/lib/validation/search-params";

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
  recruitmentReasons: ["High children-per-active-provider ratio"],
  ...overrides,
});

describe("recruitment filters and sorting", () => {
  it("parses extended recruitment filters from the URL", () => {
    expect(
      parseRecruitmentSearchParams({
        county: "Cook",
        priority: "Medium",
        minFosterChildren: "12",
        ageGroup: "13–17",
        minOutOfCountyRate: "0.1",
        maxOutOfCountyRate: "0.5",
        sort: "expiring_90_days",
        direction: "asc",
      }),
    ).toEqual({
      county: "Cook",
      priority: "Medium",
      minFosterChildren: 12,
      ageGroup: "13–17",
      minOutOfCountyRate: 0.1,
      maxOutOfCountyRate: 0.5,
      sort: "expiring_90_days",
      direction: "asc",
    });
  });

  it("rejects invalid out-of-county rate ranges", () => {
    const result = safeParseRecruitmentSearchParams({
      minOutOfCountyRate: "0.8",
      maxOutOfCountyRate: "0.2",
    });

    expect(result.success).toBe(false);
  });

  it("sorts recruitment priority with a fixed high-to-limited order", () => {
    const counties = [
      sampleCounty({ county: "A", recruitmentPriority: "Low" }),
      sampleCounty({ county: "B", recruitmentPriority: "High" }),
      sampleCounty({ county: "C", recruitmentPriority: "Limited data" }),
      sampleCounty({ county: "D", recruitmentPriority: "Medium" }),
    ];

    const sorted = sortRecruitmentCounties(counties, "recruitment_priority", "asc");
    expect(sorted.map((county) => county.county)).toEqual(["B", "D", "A", "C"]);
  });

  it("partitions limited-data counties separately", () => {
    const counties = [
      sampleCounty({ county: "Cook", recruitmentPriority: "High" }),
      sampleCounty({ county: "Tiny", recruitmentPriority: "Limited data" }),
    ];

    const { eligible, limitedData } = partitionRecruitmentCounties(counties);
    expect(eligible).toHaveLength(1);
    expect(limitedData).toHaveLength(1);
    expect(limitedData[0]?.county).toBe("Tiny");
  });
});

describe("recruitment export", () => {
  it("serializes filtered export rows to CSV", () => {
    const csv = serializeCsv(mapRecruitmentExportRows([sampleCounty()]));
    expect(csv).toContain("county,recruitment_priority");
    expect(csv).toContain("Cook,High recruitment attention,80,20");
    expect(csv).toContain("6–12");
  });

  it("sanitizes export filenames", () => {
    expect(sanitizeExportFilename('recruitment counties/2026-07-01?.csv')).toBe(
      "recruitment-counties-2026-07-01-.csv",
    );
  });

  it("documents the export row cap", () => {
    expect(MAX_EXPORT_ROWS).toBe(5000);
  });
});
