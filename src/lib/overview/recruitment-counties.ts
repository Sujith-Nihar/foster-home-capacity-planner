import type { CountyMetricsDto, RecruitmentPriority } from "@/lib/types/domain";

const ATTENTION_RANK: Record<RecruitmentPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
  "Limited data": 3,
};

export const OVERVIEW_RECRUITMENT_COUNTY_LIMIT = 5;

export function sortOverviewRecruitmentCounties(
  counties: CountyMetricsDto[],
): CountyMetricsDto[] {
  return [...counties]
    .filter((county) => county.recruitmentPriority !== "Limited data")
    .sort((left, right) => {
      const attentionDifference =
        ATTENTION_RANK[left.recruitmentPriority] - ATTENTION_RANK[right.recruitmentPriority];
      if (attentionDifference !== 0) {
        return attentionDifference;
      }

      const ratioDifference =
        (right.childrenPerActiveProvider ?? -1) - (left.childrenPerActiveProvider ?? -1);
      if (ratioDifference !== 0) {
        return ratioDifference;
      }

      return right.currentFosterHomeChildren - left.currentFosterHomeChildren;
    });
}

export function selectOverviewRecruitmentCounties(
  counties: CountyMetricsDto[],
  limit = OVERVIEW_RECRUITMENT_COUNTY_LIMIT,
): CountyMetricsDto[] {
  return sortOverviewRecruitmentCounties(counties).slice(0, limit);
}
