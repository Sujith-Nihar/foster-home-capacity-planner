import { formatCount } from "@/lib/utils/formatters";

export function formatUnitCount(count: number, singular: string, plural?: string): string {
  const pluralLabel = plural ?? `${singular}s`;
  return `${formatCount(count)} ${count === 1 ? singular : pluralLabel}`;
}

export function formatDayCount(count: number): string {
  return formatUnitCount(count, "day");
}

export function formatActiveDayCount(count: number): string {
  return formatUnitCount(count, "active day", "active days");
}

export function formatEndsInDayCount(count: number): string {
  return `Ends in ${formatDayCount(count)}`;
}

export function formatAdditionalFactorCount(count: number): string {
  return count === 1 ? "View 1 more factor" : `View ${formatCount(count)} more factors`;
}
