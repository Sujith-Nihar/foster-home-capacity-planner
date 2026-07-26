import type { AgeGroupLabel } from "@/config/metrics";
import type { MeasurableAgeGroupLabel } from "@/lib/recruitment/age-groups";

export type RecruitmentPriority = "High" | "Medium" | "Low" | "Limited data";
export type OutreachPriority = "High" | "Medium" | "Low";
export type SortDirection = "asc" | "desc";

export type DatasetMetadataDto = {
  datasetVersion: string;
  reportingDate: string;
  generatedAt: string;
  sourceHash: string;
  etlVersion: string;
  providerCount: number;
  childCount: number;
  placementCount: number;
};

export type SystemSnapshotDto = {
  reportingDate: string;
  currentChildrenInCare: number;
  currentFosterHomeChildren: number;
  currentKinChildren: number;
  currentNonfamilyChildren: number;
  currentlyLicensedProviders: number;
  currentlyActiveProviders: number;
  highRecruitmentCounties: number;
  highRetentionProviders: number;
};

export type CountyMetricsDto = {
  county: string;
  reportingDate: string;
  currentChildrenInCare: number;
  currentFosterHomeChildren: number;
  currentKinChildren: number;
  currentNonfamilyChildren: number;
  licensedProviders: number;
  activeProviders: number;
  inactiveProviders: number;
  childrenPerActiveProvider: number | null;
  outOfCountyFosterCount: number;
  outOfCountyFosterRate: number | null;
  expiring90Days: number;
  expiring180Days: number;
  highRetentionProviders: number;
  mediumRetentionProviders: number;
  highestPressureAgeGroup: AgeGroupLabel | null;
  recruitmentPriority: RecruitmentPriority;
  recruitmentReasons: string[];
};

export type CountyAgeMetricsDto = {
  county: string;
  ageGroup: AgeGroupLabel;
  reportingDate: string;
  currentFosterHomeChildren: number;
  matchingLicensedProviders: number;
  matchingActiveProviders: number;
  childrenPerMatchingActiveProvider: number | null;
};

export type ProviderMetricsDto = {
  providerId: number;
  county: string;
  reportingDate: string;
  licenseStartDate: string;
  licenseEndDate: string;
  daysUntilExpiration: number;
  currentlyHasPlacement: boolean;
  lastCompletedPlacementEnd: string | null;
  daysSinceLastPlacement: number | null;
  totalActiveDays: number;
  activeDaysLast365: number;
  eligibleLicensedDaysLast365: number;
  engagementRateLast365: number | null;
  minAge: number;
  maxAge: number;
  outreachPriority: OutreachPriority;
  outreachReasons: string[];
};

export type ProviderActivityPeriodDto = {
  providerId: number;
  periodStart: string;
  periodEnd: string;
  activeDays: number;
  isCurrent: boolean;
};

export type MonthlyMetricsDto = {
  month: string;
  newLicenseStarts: number;
  licenseExpirations: number;
  activeProviderCount: number;
  fosterHomePlacementStarts: number;
};

export type FilterOptionsDto = {
  reportingDate: string;
  counties: string[];
  recruitmentPriorities: RecruitmentPriority[];
  outreachPriorities: OutreachPriority[];
  ageGroups: AgeGroupLabel[];
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type RetentionPriorityDistributionDto = {
  high: number;
  medium: number;
  low: number;
};

export type RetentionSummaryDto = {
  currentlyLicensedProviders: number;
  currentlyActiveProviders: number;
  inactiveProviders: number;
  licensesExpiringWithin90Days: number;
  highOutreachPriorityProviders: number;
};

export type OverviewInsightsDto = {
  headline: string;
  bullets: string[];
};

export type CountyDetailDto = {
  county: CountyMetricsDto;
  ageGroups: CountyAgeMetricsDto[];
  retentionProviders: ProviderMetricsDto[];
};

export type ProviderDetailDto = {
  provider: ProviderMetricsDto;
  activityPeriods: ProviderActivityPeriodDto[];
};

export type ProviderPageData = ProviderDetailDto & {
  reviewSummary: string;
  preferredAgeRangeLabel: string;
  ageGroupOverlapNote: string | null;
  countyRecruitmentOverlapSentence: string | null;
  highestPressureAgeGroup: MeasurableAgeGroupLabel | null;
};
