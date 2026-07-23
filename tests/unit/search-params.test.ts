import { describe, expect, it } from "vitest";

import {
  isAllowedRecruitmentSortField,
  isAllowedRetentionSortField,
  isAllowedSortDirection,
  parseRecruitmentSearchParams,
  parseRetentionExportSearchParams,
  parseRetentionSearchParams,
  RECRUITMENT_SORT_FIELDS,
  RETENTION_SORT_FIELDS,
  safeParseRecruitmentSearchParams,
  safeParseRetentionSearchParams,
} from "@/lib/validation/search-params";
import { MAX_EXPORT_ROWS } from "@/lib/utils/csv";

describe("recruitment search params", () => {
  it("applies defaults for an empty query string", () => {
    expect(parseRecruitmentSearchParams({})).toEqual({
      sort: "children_per_active_provider",
      direction: "desc",
    });
  });

  it("parses priority and sort values", () => {
    expect(
      parseRecruitmentSearchParams({
        priority: "High",
        sort: "out_of_county_foster_rate",
        direction: "asc",
      }),
    ).toEqual({
      priority: "High",
      sort: "out_of_county_foster_rate",
      direction: "asc",
    });
  });

  it("rejects invalid sort fields", () => {
    const result = safeParseRecruitmentSearchParams({ sort: "id_child" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priorities", () => {
    const result = safeParseRecruitmentSearchParams({ priority: "Critical" });
    expect(result.success).toBe(false);
  });
});

describe("retention search params", () => {
  it("applies pagination defaults", () => {
    expect(parseRetentionSearchParams({})).toEqual({
      activity: "all",
      expiration: "all",
      sort: "outreach_priority",
      direction: "asc",
      page: 1,
      pageSize: 25,
    });
  });

  it("parses provider, county, and engagement filters", () => {
    expect(
      parseRetentionSearchParams({
        county: "Cook",
        priority: "High",
        activity: "inactive",
        expiration: "within_90",
        providerId: "500001",
        minEngagement: "0.1",
        maxEngagement: "0.5",
        page: "2",
        pageSize: "50",
      }),
    ).toEqual({
      county: "Cook",
      priority: "High",
      activity: "inactive",
      expiration: "within_90",
      providerId: 500001,
      minEngagement: 0.1,
      maxEngagement: 0.5,
      sort: "outreach_priority",
      direction: "asc",
      page: 2,
      pageSize: 50,
    });
  });

  it("rejects invalid page sizes", () => {
    const result = safeParseRetentionSearchParams({ pageSize: "500" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid engagement values", () => {
    const result = safeParseRetentionSearchParams({ minEngagement: "2" });
    expect(result.success).toBe(false);
  });

  it("allows export page sizes up to the export row cap", () => {
    expect(
      parseRetentionExportSearchParams({
        providerId: "500021",
      }),
    ).toMatchObject({
      providerId: 500021,
      page: 1,
      pageSize: MAX_EXPORT_ROWS,
    });
  });
});

describe("sort allowlists", () => {
  it("allows documented recruitment sort fields only", () => {
    for (const field of RECRUITMENT_SORT_FIELDS) {
      expect(isAllowedRecruitmentSortField(field)).toBe(true);
    }
    expect(isAllowedRecruitmentSortField("id_child")).toBe(false);
  });

  it("allows documented retention sort fields only", () => {
    for (const field of RETENTION_SORT_FIELDS) {
      expect(isAllowedRetentionSortField(field)).toBe(true);
    }
    expect(isAllowedRetentionSortField("license_start_date")).toBe(false);
  });

  it("allows asc and desc only", () => {
    expect(isAllowedSortDirection("asc")).toBe(true);
    expect(isAllowedSortDirection("desc")).toBe(true);
    expect(isAllowedSortDirection("up")).toBe(false);
  });
});
