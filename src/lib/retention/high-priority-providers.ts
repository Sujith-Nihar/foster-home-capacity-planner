import { RETENTION_PROVIDER_LIST_HASH } from "@/lib/retention/expiring-licenses";
import { buildRetentionQueryString } from "@/lib/retention/query";

export function buildHighPriorityProvidersHref(): string {
  return `/retention${buildRetentionQueryString({
    priority: "High",
    sort: "outreach_priority",
    direction: "asc",
    page: 1,
    activity: "all",
  })}${RETENTION_PROVIDER_LIST_HASH}`;
}
