import { formatCount } from "@/lib/utils/formatters";

export function normalizePage(page: number, totalPages: number): number {
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  if (totalPages === 0) {
    return 1;
  }

  return Math.min(page, totalPages);
}

export function computeTotalPages(totalCount: number, pageSize: number): number {
  if (totalCount === 0) {
    return 0;
  }

  return Math.ceil(totalCount / pageSize);
}

export function computePageRange(
  page: number,
  pageSize: number,
  totalCount: number,
): { startIndex: number; endIndex: number } {
  if (totalCount === 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);
  return { startIndex, endIndex };
}

export function formatResultRangeLabel(
  startIndex: number,
  endIndex: number,
  totalCount: number,
  noun: string,
  nounPlural: string,
): string {
  const label = totalCount === 1 ? noun : nounPlural;

  if (totalCount === 0) {
    return `Showing 0 ${nounPlural}`;
  }

  if (totalCount === 1) {
    return `Showing 1 ${noun}`;
  }

  return `Showing ${formatCount(startIndex)}–${formatCount(endIndex)} of ${formatCount(totalCount)} ${label}`;
}

export function formatLiveRangeAnnouncement(
  startIndex: number,
  endIndex: number,
  totalCount: number,
  nounPlural: string,
): string {
  if (totalCount === 0) {
    return `No ${nounPlural} match the selected filters.`;
  }

  if (totalCount === 1) {
    return `Showing 1 ${nounPlural.slice(0, -1) || nounPlural}.`;
  }

  return `Showing ${nounPlural} ${formatCount(startIndex)} through ${formatCount(endIndex)} of ${formatCount(totalCount)}.`;
}
