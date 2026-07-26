import { describe, expect, it } from "vitest";

import { buildRetentionResultCountMessage } from "@/lib/retention/result-count";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

const baseParams: RetentionSearchParams = {
  activity: "all",
  expiration: "all",
  sort: "outreach_priority",
  direction: "asc",
  page: 1,
  pageSize: 10,
};

describe("buildRetentionResultCountMessage", () => {
  it("uses licensed providers shown for statewide results", () => {
    expect(buildRetentionResultCountMessage(3391, baseParams)).toBe(
      "3,391 licensed providers shown",
    );
  });

  it("includes the county name when a county filter is active", () => {
    expect(
      buildRetentionResultCountMessage(42, {
        ...baseParams,
        county: "Cook",
      }),
    ).toBe("42 licensed providers shown in Cook County");
  });
});
