import {
  getSuggestedRecruitmentAttention,
  type SuggestedRecruitmentAttention,
} from "@/lib/recruitment/classification";
import type { RecruitmentPriority, SortDirection } from "@/lib/types/domain";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

const ATTENTION_SORT_ORDER: Record<SuggestedRecruitmentAttention, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
  "Not scored": 3,
};

export function sortRecruitmentCounties<T extends { recruitmentPriority: RecruitmentPriority }>(
  counties: T[],
  sort: RecruitmentSearchParams["sort"],
  direction: SortDirection,
): T[] {
  if (sort !== "recruitment_priority") {
    return counties;
  }

  return [...counties].sort((left, right) => {
    const difference =
      ATTENTION_SORT_ORDER[getSuggestedRecruitmentAttention(left)] -
      ATTENTION_SORT_ORDER[getSuggestedRecruitmentAttention(right)];
    return direction === "asc" ? difference : -difference;
  });
}

export function buildRecruitmentQueryString(
  params: Partial<RecruitmentSearchParams> & Pick<RecruitmentSearchParams, "sort" | "direction">,
): string {
  const search = new URLSearchParams();

  if (params.county) {
    search.set("county", params.county);
  }
  if (params.priority) {
    search.set("priority", params.priority);
  }
  if (params.comparisonStatus && params.comparisonStatus !== "eligible") {
    search.set("comparisonStatus", params.comparisonStatus);
  }
  if (params.minFosterChildren !== undefined) {
    search.set("minFosterChildren", String(params.minFosterChildren));
  }
  if (params.ageGroup) {
    search.set("ageGroup", params.ageGroup);
  }
  if (params.minOutOfCountyRate !== undefined) {
    search.set("minOutOfCountyRate", String(params.minOutOfCountyRate));
  }
  if (params.maxOutOfCountyRate !== undefined) {
    search.set("maxOutOfCountyRate", String(params.maxOutOfCountyRate));
  }
  search.set("sort", params.sort);
  search.set("direction", params.direction);

  const query = search.toString();
  return query.length > 0 ? `?${query}` : "";
}

export function buildRecruitmentSortHref(
  current: RecruitmentSearchParams,
  sort: RecruitmentSearchParams["sort"],
): string {
  const direction =
    current.sort === sort ? (current.direction === "desc" ? "asc" : "desc") : "desc";

  return `/recruitment${buildRecruitmentQueryString({
    ...current,
    sort,
    direction,
  })}`;
}
