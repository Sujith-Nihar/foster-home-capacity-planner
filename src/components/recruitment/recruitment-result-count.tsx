import { formatCount } from "@/lib/utils/formatters";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

type RecruitmentResultCountProps = {
  totalCount: number;
  comparisonStatus: RecruitmentSearchParams["comparisonStatus"];
  className?: string;
};

export function buildRecruitmentResultMessage(
  totalCount: number,
  comparisonStatus: RecruitmentSearchParams["comparisonStatus"],
): string {
  const formattedCount = formatCount(totalCount);

  if (totalCount === 0) {
    if (comparisonStatus === "eligible") {
      return "No eligible counties shown";
    }
    if (comparisonStatus === "limited") {
      return "No limited-data counties shown";
    }
    return "No counties shown";
  }

  if (comparisonStatus === "eligible") {
    return totalCount === 1
      ? `${formattedCount} eligible county shown`
      : `${formattedCount} eligible counties shown`;
  }

  if (comparisonStatus === "limited") {
    return totalCount === 1
      ? `${formattedCount} limited-data county shown`
      : `${formattedCount} limited-data counties shown`;
  }

  return totalCount === 1
    ? `${formattedCount} county shown`
    : `${formattedCount} counties shown`;
}

export function RecruitmentResultCount({
  totalCount,
  comparisonStatus,
  className,
}: RecruitmentResultCountProps) {
  return (
    <p
      className={className ?? "operational-filter-result-count"}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {buildRecruitmentResultMessage(totalCount, comparisonStatus)}
    </p>
  );
}
