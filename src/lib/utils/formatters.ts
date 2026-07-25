import { format, parseISO } from "date-fns";

import type { OutreachPriority, RecruitmentPriority } from "@/lib/types/domain";
import type {
  ComparisonStatus,
  SuggestedRecruitmentAttention,
} from "@/lib/recruitment/classification";

export function formatReportingDate(value: string): string {
  return format(parseISO(value), "MMMM d, yyyy");
}

export function formatMonthLabel(value: string): string {
  return format(parseISO(value), "MMM yyyy");
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDecimal(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${formatDecimal(value * 100, fractionDigits)}%`;
}

export function formatNullablePercent(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return formatPercent(value);
}

export function formatRatio(
  value: number | null | undefined,
  fractionDigits = 2,
): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return formatDecimal(value, fractionDigits);
}

export function formatDays(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${formatCount(value)} days`;
}

export function formatSuggestedRecruitmentAttentionLabel(
  attention: SuggestedRecruitmentAttention,
): string {
  if (attention === "Not scored") {
    return "Not scored";
  }
  return `${attention} attention`;
}

export function formatComparisonStatusLabel(status: ComparisonStatus): string {
  return status;
}

export function formatRecruitmentPriorityLabel(priority: RecruitmentPriority): string {
  if (priority === "Limited data") {
    return "Not scored";
  }
  return `${priority} recruitment attention`;
}

export function formatCompactRecruitmentPriorityLabel(priority: RecruitmentPriority): string {
  if (priority === "Limited data") {
    return "Not scored";
  }
  return `${priority} attention`;
}

export function formatOutreachPriorityLabel(priority: OutreachPriority): string {
  return `${priority} outreach priority`;
}

export function formatCompactOutreachPriorityLabel(priority: OutreachPriority): string {
  return `${priority} outreach`;
}

export function formatCountyName(county: string): string {
  return `${county} County`;
}

export function formatProviderId(providerId: number): string {
  return providerId.toString();
}

export function formatBooleanLabel(value: boolean, trueLabel: string, falseLabel: string): string {
  return value ? trueLabel : falseLabel;
}

export function formatAgePreferenceRange(minAge: number, maxAge: number): string {
  return `Ages ${minAge}–${maxAge}`;
}

export function parseReasonTags(value: string[] | string | null | undefined): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
