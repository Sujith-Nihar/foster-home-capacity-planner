import { formatCount, formatCountyName } from "@/lib/utils/formatters";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

export function buildRetentionResultCountMessage(
  totalCount: number,
  searchParams: RetentionSearchParams,
): string {
  const countLabel = formatCount(totalCount);

  if (searchParams.county) {
    return `${countLabel} licensed providers shown in ${formatCountyName(searchParams.county)}`;
  }

  return `${countLabel} licensed providers shown`;
}
