import { describe, expect, it } from "vitest";

import {
  buildExpiringLicensesHref,
  isExpiringLicensesViewActive,
} from "@/lib/retention/expiring-licenses";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

const baseParams: RetentionSearchParams = {
  activity: "all",
  expiration: "all",
  sort: "outreach_priority",
  direction: "asc",
  page: 1,
  pageSize: 25,
};

describe("expiring licenses retention action", () => {
  it("builds a shareable retention URL with expiration sort and list anchor", () => {
    expect(buildExpiringLicensesHref()).toBe(
      "/retention?expiration=within_90&sort=days_until_expiration&direction=asc#licensed-provider-list",
    );
  });

  it("detects when the expiring-licenses view is already active", () => {
    expect(
      isExpiringLicensesViewActive({
        ...baseParams,
        expiration: "within_90",
        sort: "days_until_expiration",
        direction: "asc",
      }),
    ).toBe(true);

    expect(
      isExpiringLicensesViewActive({
        ...baseParams,
        expiration: "within_90",
      }),
    ).toBe(false);
  });
});
