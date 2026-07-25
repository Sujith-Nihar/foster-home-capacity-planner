import { buildRecruitmentQueryString } from "@/lib/recruitment/query";
import { buildRetentionQueryString } from "@/lib/retention/query";
import type { RecruitmentSearchParams, RetentionSearchParams } from "@/lib/validation/search-params";

export function buildRecruitmentResultsKey(params: RecruitmentSearchParams): string {
  return buildRecruitmentQueryString(params);
}

export function buildRetentionResultsKey(params: RetentionSearchParams): string {
  return buildRetentionQueryString(params);
}
