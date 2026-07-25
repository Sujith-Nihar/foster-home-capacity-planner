import { describe, expect, it } from "vitest";

import {
  buildPageNumberTokens,
} from "@/lib/pagination/page-numbers";
import {
  computePageRange,
  computeTotalPages,
  formatResultRangeLabel,
  normalizePage,
} from "@/lib/pagination/range";
import {
  buildRecruitmentPageHref,
  buildRecruitmentPageSizeHref,
  buildRecruitmentQueryString,
  buildRecruitmentSortHref,
} from "@/lib/recruitment/query";
import { parseRecruitmentSearchParams } from "@/lib/validation/search-params";
import { RECRUITMENT_DEFAULT_PAGE_SIZE } from "@/lib/pagination/constants";

describe("recruitment pagination helpers", () => {
  it("defaults to page 1 and page size 20", () => {
    expect(parseRecruitmentSearchParams({})).toMatchObject({
      page: 1,
      pageSize: 20,
      comparisonStatus: "eligible",
    });
  });

  it("coerces invalid page sizes to the default", () => {
    expect(parseRecruitmentSearchParams({ pageSize: "25" }).pageSize).toBe(20);
    expect(parseRecruitmentSearchParams({ pageSize: "50" }).pageSize).toBe(50);
  });

  it("normalizes pages beyond the last page", () => {
    expect(normalizePage(99, 5)).toBe(5);
    expect(normalizePage(0, 5)).toBe(1);
  });

  it("formats result ranges for single and multiple counties", () => {
    expect(formatResultRangeLabel(1, 1, 1, "county", "counties")).toBe("Showing 1 county");
    expect(formatResultRangeLabel(1, 20, 102, "county", "counties")).toBe(
      "Showing 1–20 of 102 counties",
    );
    expect(formatResultRangeLabel(101, 102, 102, "county", "counties")).toBe(
      "Showing 101–102 of 102 counties",
    );
  });

  it("computes page ranges for middle pages", () => {
    expect(computePageRange(2, 20, 102)).toEqual({ startIndex: 21, endIndex: 40 });
    expect(computeTotalPages(102, 20)).toBe(6);
    expect(computeTotalPages(20, 20)).toBe(1);
    expect(computeTotalPages(21, 20)).toBe(2);
  });

  it("builds condensed page number tokens", () => {
    expect(buildPageNumberTokens(1, 6)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(buildPageNumberTokens(3, 10)).toContain("ellipsis");
  });

  it("serializes pagination in the URL while omitting defaults", () => {
    expect(
      buildRecruitmentQueryString({
        sort: "children_per_active_provider",
        direction: "desc",
        page: 1,
        pageSize: RECRUITMENT_DEFAULT_PAGE_SIZE,
      }),
    ).not.toContain("page=");
  });

  it("preserves filters when building page links", () => {
    const params = parseRecruitmentSearchParams({
      priority: "High",
      ageGroup: "13–17",
      comparisonStatus: "eligible",
      page: "2",
      pageSize: "20",
    });

    expect(buildRecruitmentPageHref(params, 3)).toContain("priority=High");
    expect(buildRecruitmentPageHref(params, 3)).toContain("ageGroup=13%E2%80%9317");
    expect(buildRecruitmentPageHref(params, 3)).toContain("page=3");
  });

  it("resets page when sort changes", () => {
    const params = parseRecruitmentSearchParams({ page: "3", pageSize: "50" });
    const href = buildRecruitmentSortHref(params, "out_of_county_foster_rate");
    expect(href).not.toContain("page=3");
    expect(href).toContain("pageSize=50");
  });

  it("resets page when page size changes", () => {
    const params = parseRecruitmentSearchParams({ page: "4", pageSize: "20", priority: "High" });
    expect(buildRecruitmentPageSizeHref(params, 50)).toContain("pageSize=50");
    expect(buildRecruitmentPageSizeHref(params, 50)).not.toContain("page=4");
  });
});
