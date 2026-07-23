import { z } from "zod";

import type { AgeGroupLabel } from "@/config/metrics";
import type { SortDirection } from "@/lib/types/domain";

export const SORT_DIRECTIONS = ["asc", "desc"] as const satisfies readonly SortDirection[];

export const RECRUITMENT_PRIORITIES = [
  "High",
  "Medium",
  "Low",
  "Limited data",
] as const;

export const OUTREACH_PRIORITIES = ["High", "Medium", "Low"] as const;

export const AGE_GROUP_LABELS = ["0–5", "6–12", "13–17", "Unknown"] as const satisfies readonly AgeGroupLabel[];

export const RECRUITMENT_SORT_FIELDS = [
  "recruitment_priority",
  "current_foster_home_children",
  "children_per_active_provider",
  "out_of_county_foster_rate",
  "expiring_90_days",
] as const;

export const RETENTION_SORT_FIELDS = [
  "provider_id",
  "county",
  "days_until_expiration",
  "days_since_last_placement",
  "engagement_rate_last_365",
  "outreach_priority",
  "currently_has_placement",
] as const;

export const RETENTION_ACTIVITY_FILTERS = ["all", "active", "inactive"] as const;

export const RETENTION_EXPIRATION_FILTERS = [
  "all",
  "within_30",
  "within_60",
  "within_90",
  "within_180",
] as const;

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

function csvParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function normalizeSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, csvParam(value)]),
  );
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const recruitmentSearchSchema = z
  .object({
    priority: z.enum(RECRUITMENT_PRIORITIES).optional(),
    minFosterChildren: z.coerce.number().int().min(0).optional(),
    ageGroup: z.enum(AGE_GROUP_LABELS).optional(),
    minOutOfCountyRate: z.coerce.number().min(0).max(1).optional(),
    maxOutOfCountyRate: z.coerce.number().min(0).max(1).optional(),
    sort: z.enum(RECRUITMENT_SORT_FIELDS).default("children_per_active_provider"),
    direction: z.enum(SORT_DIRECTIONS).default("desc"),
  })
  .superRefine((value, context) => {
    if (
      value.minOutOfCountyRate !== undefined &&
      value.maxOutOfCountyRate !== undefined &&
      value.minOutOfCountyRate > value.maxOutOfCountyRate
    ) {
      context.addIssue({
        code: "custom",
        message: "minOutOfCountyRate must be less than or equal to maxOutOfCountyRate",
        path: ["minOutOfCountyRate"],
      });
    }
  });

export const retentionSearchSchema = z.object({
  county: optionalString,
  priority: z.enum(OUTREACH_PRIORITIES).optional(),
  activity: z.enum(RETENTION_ACTIVITY_FILTERS).default("all"),
  expiration: z.enum(RETENTION_EXPIRATION_FILTERS).default("all"),
  minInactivityDays: z.coerce.number().int().min(0).optional(),
  maxInactivityDays: z.coerce.number().int().min(0).optional(),
  minEngagement: z.coerce.number().min(0).max(1).optional(),
  maxEngagement: z.coerce.number().min(0).max(1).optional(),
  minAge: z.coerce.number().int().min(0).max(21).optional(),
  maxAge: z.coerce.number().int().min(0).max(21).optional(),
  providerId: z.coerce.number().int().positive().optional(),
  sort: z.enum(RETENTION_SORT_FIELDS).default("outreach_priority"),
  direction: z.enum(SORT_DIRECTIONS).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const countyProvidersSearchSchema = retentionSearchSchema.pick({
  priority: true,
  activity: true,
  expiration: true,
  sort: true,
  direction: true,
  page: true,
  pageSize: true,
});

export type RetentionFilterParams = {
  county?: string;
  priority?: (typeof OUTREACH_PRIORITIES)[number];
  activity: (typeof RETENTION_ACTIVITY_FILTERS)[number];
  expiration: (typeof RETENTION_EXPIRATION_FILTERS)[number];
  minInactivityDays?: number;
  maxInactivityDays?: number;
  minEngagement?: number;
  maxEngagement?: number;
  minAge?: number;
  maxAge?: number;
  providerId?: number;
};

export type RecruitmentSearchParams = z.infer<typeof recruitmentSearchSchema>;
export type RetentionSearchParams = z.infer<typeof retentionSearchSchema> & RetentionFilterParams;
export type CountyProvidersSearchParams = z.infer<typeof countyProvidersSearchSchema> & RetentionFilterParams;

export function parseRecruitmentSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): RecruitmentSearchParams {
  return recruitmentSearchSchema.parse(normalizeSearchParams(searchParams));
}

export function parseRetentionSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): RetentionSearchParams {
  return retentionSearchSchema.parse(normalizeSearchParams(searchParams));
}

export function parseCountyProvidersSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): CountyProvidersSearchParams {
  return countyProvidersSearchSchema.parse(normalizeSearchParams(searchParams));
}

export function safeParseRecruitmentSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return recruitmentSearchSchema.safeParse(normalizeSearchParams(searchParams));
}

export function safeParseRetentionSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return retentionSearchSchema.safeParse(normalizeSearchParams(searchParams));
}

export function isAllowedRecruitmentSortField(
  value: string,
): value is (typeof RECRUITMENT_SORT_FIELDS)[number] {
  return (RECRUITMENT_SORT_FIELDS as readonly string[]).includes(value);
}

export function isAllowedRetentionSortField(
  value: string,
): value is (typeof RETENTION_SORT_FIELDS)[number] {
  return (RETENTION_SORT_FIELDS as readonly string[]).includes(value);
}

export function isAllowedSortDirection(value: string): value is SortDirection {
  return (SORT_DIRECTIONS as readonly string[]).includes(value);
}
