import { buildRetentionQueryString } from "@/lib/retention/query";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

export const RETENTION_PROVIDER_LIST_ID = "licensed-provider-list";
export const RETENTION_PROVIDER_LIST_HASH = `#${RETENTION_PROVIDER_LIST_ID}`;

export function isExpiringLicensesViewActive(searchParams: RetentionSearchParams): boolean {
  return (
    searchParams.expiration === "within_90" &&
    searchParams.sort === "days_until_expiration" &&
    searchParams.direction === "asc"
  );
}

export function buildExpiringLicensesHref(): string {
  return `/retention${buildRetentionQueryString({
    expiration: "within_90",
    sort: "days_until_expiration",
    direction: "asc",
    page: 1,
    activity: "all",
  })}${RETENTION_PROVIDER_LIST_HASH}`;
}
