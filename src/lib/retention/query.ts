import type { OutreachPriority, SortDirection } from "@/lib/types/domain";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

const OUTREACH_PRIORITY_ORDER: Record<OutreachPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export function sortRetentionProviders<T extends { outreachPriority: OutreachPriority }>(
  providers: T[],
  sort: RetentionSearchParams["sort"],
  direction: SortDirection,
): T[] {
  if (sort !== "outreach_priority") {
    return providers;
  }

  return [...providers].sort((left, right) => {
    const difference =
      OUTREACH_PRIORITY_ORDER[left.outreachPriority] -
      OUTREACH_PRIORITY_ORDER[right.outreachPriority];
    return direction === "asc" ? difference : -difference;
  });
}

export function buildRetentionQueryString(
  params: Partial<RetentionSearchParams> &
    Pick<RetentionSearchParams, "sort" | "direction">,
): string {
  const search = new URLSearchParams();

  if (params.providerId !== undefined) {
    search.set("providerId", String(params.providerId));
  }
  if (params.county) {
    search.set("county", params.county);
  }
  if (params.priority) {
    search.set("priority", params.priority);
  }
  if (params.activity && params.activity !== "all") {
    search.set("activity", params.activity);
  }
  if (params.expiration && params.expiration !== "all") {
    search.set("expiration", params.expiration);
  }
  if (params.minInactivityDays !== undefined) {
    search.set("minInactivityDays", String(params.minInactivityDays));
  }
  if (params.maxInactivityDays !== undefined) {
    search.set("maxInactivityDays", String(params.maxInactivityDays));
  }
  if (params.minEngagement !== undefined) {
    search.set("minEngagement", String(params.minEngagement));
  }
  if (params.maxEngagement !== undefined) {
    search.set("maxEngagement", String(params.maxEngagement));
  }
  if (params.minAge !== undefined) {
    search.set("minAge", String(params.minAge));
  }
  if (params.maxAge !== undefined) {
    search.set("maxAge", String(params.maxAge));
  }
  if (params.page !== undefined && params.page > 1) {
    search.set("page", String(params.page));
  }
  if (params.pageSize !== undefined && params.pageSize !== 25) {
    search.set("pageSize", String(params.pageSize));
  }
  search.set("sort", params.sort);
  search.set("direction", params.direction);

  const query = search.toString();
  return query.length > 0 ? `?${query}` : "";
}

export function buildRetentionSortHref(
  current: RetentionSearchParams,
  sort: RetentionSearchParams["sort"],
): string {
  const direction =
    current.sort === sort ? (current.direction === "desc" ? "asc" : "desc") : "desc";

  return `/retention${buildRetentionQueryString({
    ...current,
    sort,
    direction,
    page: 1,
  })}`;
}

export function buildRetentionPageHref(
  current: RetentionSearchParams,
  page: number,
): string {
  return `/retention${buildRetentionQueryString({
    ...current,
    page,
  })}`;
}

export function buildRetentionPageSizeHref(
  current: RetentionSearchParams,
  pageSize: number,
): string {
  return `/retention${buildRetentionQueryString({
    ...current,
    page: 1,
    pageSize,
  })}`;
}
