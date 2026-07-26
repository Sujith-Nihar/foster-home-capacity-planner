"use client";

import { useCallback, useMemo, useState } from "react";

import { ActiveFilterChips } from "@/components/retention/active-filter-chips";
import { RetentionOutreachMethodologyNote } from "@/components/retention/retention-outreach-methodology-note";
import {
  OperationalFilterField,
  OperationalFilterGrid,
  OperationalFilterPanel,
  OPERATIONAL_FILTER_CONTROL_CLASS,
} from "@/components/operational/operational-filter-panel";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOperationalFilters } from "@/hooks/use-operational-filters";
import { useSyncDraftFromApplied } from "@/hooks/use-sync-draft-from-applied";
import { buildRetentionQueryString } from "@/lib/retention/query";
import type { FilterOptionsDto } from "@/lib/types/domain";
import {
  OUTREACH_PRIORITIES,
  RETENTION_ACTIVITY_FILTERS,
  RETENTION_EXPIRATION_FILTERS,
  type RetentionSearchParams,
} from "@/lib/validation/search-params";

type RetentionFilterToolbarProps = {
  filterOptions: FilterOptionsDto;
  searchParams: RetentionSearchParams;
  exportQuery: string;
  title: string;
  titleId: string;
  showResultCount?: boolean;
  totalCount?: number;
};

const ALL_FILTER_VALUE = "all";

const ACTIVITY_LABELS: Record<(typeof RETENTION_ACTIVITY_FILTERS)[number], string> = {
  all: "All placement statuses",
  active: "Has a current placement",
  inactive: "No current placement",
};

const EXPIRATION_LABELS: Record<(typeof RETENTION_EXPIRATION_FILTERS)[number], string> = {
  all: "Any license-ending period",
  within_30: "Within 30 days",
  within_60: "Within 60 days",
  within_90: "Within 90 days",
  within_180: "Within 180 days",
};

const PRIORITY_LABELS: Record<(typeof OUTREACH_PRIORITIES)[number], string> = {
  High: "High outreach",
  Medium: "Medium outreach",
  Low: "Low outreach",
};

function decimalToPercent(value: number | undefined): string {
  if (value === undefined) {
    return "";
  }
  return String(Math.round(value * 100));
}

function percentToDecimal(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed / 100;
}

function hasAdvancedFilters(searchParams: RetentionSearchParams): boolean {
  return (
    searchParams.minInactivityDays !== undefined ||
    searchParams.maxInactivityDays !== undefined ||
    searchParams.minEngagement !== undefined ||
    searchParams.maxEngagement !== undefined ||
    searchParams.minAge !== undefined ||
    searchParams.maxAge !== undefined
  );
}

function createDraftState(searchParams: RetentionSearchParams) {
  return {
    providerId: searchParams.providerId?.toString() ?? "",
    county: searchParams.county ?? ALL_FILTER_VALUE,
    priority: searchParams.priority ?? ALL_FILTER_VALUE,
    activity: searchParams.activity,
    expiration: searchParams.expiration,
    minInactivityDays: searchParams.minInactivityDays?.toString() ?? "",
    minEngagementPercent: decimalToPercent(searchParams.minEngagement),
    maxEngagementPercent: decimalToPercent(searchParams.maxEngagement),
    minAge: searchParams.minAge?.toString() ?? "",
    maxAge: searchParams.maxAge?.toString() ?? "",
    moreFiltersOpen: hasAdvancedFilters(searchParams),
  };
}

export function RetentionFilterToolbar({
  filterOptions,
  searchParams,
  exportQuery,
  totalCount = 0,
  title,
  titleId,
  showResultCount = true,
}: RetentionFilterToolbarProps) {
  const { navigate, isPending } = useOperationalFilters();
  const [draft, setDraft] = useState(() => createDraftState(searchParams));

  const syncDraft = useCallback((applied: RetentionSearchParams) => {
    setDraft(createDraftState(applied));
  }, []);

  useSyncDraftFromApplied(searchParams, syncDraft, (applied) =>
    buildRetentionQueryString(applied),
  );

  function buildNextParams(): Partial<RetentionSearchParams> &
    Pick<RetentionSearchParams, "sort" | "direction"> {
    return {
      sort: searchParams.sort,
      direction: searchParams.direction,
      page: 1,
      providerId: draft.providerId ? Number(draft.providerId) : undefined,
      county: draft.county !== ALL_FILTER_VALUE ? draft.county : undefined,
      priority:
        draft.priority !== ALL_FILTER_VALUE
          ? (draft.priority as RetentionSearchParams["priority"])
          : undefined,
      activity: draft.activity,
      expiration: draft.expiration,
      minInactivityDays: draft.minInactivityDays ? Number(draft.minInactivityDays) : undefined,
      minEngagement: percentToDecimal(draft.minEngagementPercent),
      maxEngagement: percentToDecimal(draft.maxEngagementPercent),
      minAge: draft.minAge ? Number(draft.minAge) : undefined,
      maxAge: draft.maxAge ? Number(draft.maxAge) : undefined,
    };
  }

  function applyFilters() {
    navigate(buildRetentionQueryString(buildNextParams()));
  }

  function clearFilters() {
    setDraft({
      providerId: "",
      county: ALL_FILTER_VALUE,
      priority: ALL_FILTER_VALUE,
      activity: "all",
      expiration: "all",
      minInactivityDays: "",
      minEngagementPercent: "",
      maxEngagementPercent: "",
      minAge: "",
      maxAge: "",
      moreFiltersOpen: false,
    });
    navigate(
      buildRetentionQueryString({
        sort: searchParams.sort,
        direction: searchParams.direction,
      }),
    );
  }

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchParams.providerId ||
        searchParams.county ||
        searchParams.priority ||
        searchParams.activity !== "all" ||
        searchParams.expiration !== "all" ||
        searchParams.minInactivityDays !== undefined ||
        searchParams.minEngagement !== undefined ||
        searchParams.maxEngagement !== undefined ||
        searchParams.minAge !== undefined ||
        searchParams.maxAge !== undefined,
    );
  }, [searchParams]);

  const advancedFilterCount = useMemo(() => {
    let count = 0;
    if (searchParams.minInactivityDays !== undefined || searchParams.maxInactivityDays !== undefined) {
      count += 1;
    }
    if (searchParams.minEngagement !== undefined || searchParams.maxEngagement !== undefined) {
      count += 1;
    }
    if (searchParams.minAge !== undefined || searchParams.maxAge !== undefined) count += 1;
    return count;
  }, [searchParams]);

  return (
    <OperationalFilterPanel
      title={title}
      titleId={titleId}
      description={
        <div className="space-y-3">
          <p>
            Review licensed providers by suggested outreach priority, placement activity, and license
            timing.
          </p>
          <RetentionOutreachMethodologyNote />
        </div>
      }
      primaryFilters={
        <>
          <OperationalFilterField label="Provider search" className="operational-filter-search-field">
            <Input
              type="search"
              inputMode="numeric"
              value={draft.providerId}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  providerId: event.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder="Search by provider ID"
              className={OPERATIONAL_FILTER_CONTROL_CLASS}
            />
          </OperationalFilterField>

          <OperationalFilterGrid>
          <OperationalFilterField label="County">
            <Select
              value={draft.county}
              onValueChange={(value) =>
                setDraft((current) => ({ ...current, county: value ?? ALL_FILTER_VALUE }))
              }
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
                <SelectValue placeholder="All counties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>All counties</SelectItem>
                {filterOptions.counties.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </OperationalFilterField>

          <OperationalFilterField label="Suggested outreach priority">
            <Select
              value={draft.priority}
              onValueChange={(value) =>
                setDraft((current) => ({ ...current, priority: value ?? ALL_FILTER_VALUE }))
              }
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
                <SelectValue placeholder="All outreach priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>All outreach priorities</SelectItem>
                {OUTREACH_PRIORITIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {PRIORITY_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </OperationalFilterField>

          <OperationalFilterField label="Current placement status">
            <Select
              value={draft.activity}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  activity: (value ?? "all") as RetentionSearchParams["activity"],
                }))
              }
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
                <SelectValue placeholder="All placement statuses" />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_ACTIVITY_FILTERS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {ACTIVITY_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </OperationalFilterField>

          <OperationalFilterField label="License ending within">
            <Select
              value={draft.expiration}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  expiration: (value ?? "all") as RetentionSearchParams["expiration"],
                }))
              }
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
                <SelectValue placeholder="Any license-ending period" />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_EXPIRATION_FILTERS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {EXPIRATION_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </OperationalFilterField>
          </OperationalFilterGrid>
        </>
      }
      advancedFilters={
        <>
          <OperationalFilterField label="Minimum days since last placement">
            <Input
              type="number"
              min={0}
              step={1}
              value={draft.minInactivityDays}
              onChange={(event) =>
                setDraft((current) => ({ ...current, minInactivityDays: event.target.value }))
              }
              placeholder="e.g. 90"
              className={OPERATIONAL_FILTER_CONTROL_CLASS}
            />
          </OperationalFilterField>

          <OperationalFilterField label="Placement activity percentage range">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={draft.minEngagementPercent}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, minEngagementPercent: event.target.value }))
                }
                placeholder="Min %"
                aria-label="Minimum engagement rate percent"
                className={OPERATIONAL_FILTER_CONTROL_CLASS}
              />
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={draft.maxEngagementPercent}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, maxEngagementPercent: event.target.value }))
                }
                placeholder="Max %"
                aria-label="Maximum engagement rate percent"
                className={OPERATIONAL_FILTER_CONTROL_CLASS}
              />
            </div>
          </OperationalFilterField>

          <OperationalFilterField label="Preferred child age range">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                max={21}
                step={1}
                value={draft.minAge}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, minAge: event.target.value }))
                }
                placeholder="Min age"
                aria-label="Minimum preferred child age"
                className={OPERATIONAL_FILTER_CONTROL_CLASS}
              />
              <Input
                type="number"
                min={0}
                max={21}
                step={1}
                value={draft.maxAge}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, maxAge: event.target.value }))
                }
                placeholder="Max age"
                aria-label="Maximum preferred child age"
                className={OPERATIONAL_FILTER_CONTROL_CLASS}
              />
            </div>
          </OperationalFilterField>
        </>
      }
      moreFiltersOpen={draft.moreFiltersOpen}
      onMoreFiltersToggle={() =>
        setDraft((current) => ({ ...current, moreFiltersOpen: !current.moreFiltersOpen }))
      }
      advancedFilterCount={advancedFilterCount}
      activeFilterChips={
        hasActiveFilters ? (
          <ActiveFilterChips
            searchParams={searchParams}
            filterOptions={filterOptions}
            onClearAll={clearFilters}
          />
        ) : null
      }
      onApply={applyFilters}
      onClear={clearFilters}
      exportHref={`/api/exports/retention${exportQuery ? `?${exportQuery}` : ""}`}
      isPending={isPending}
      resultCount={totalCount}
      resultNoun="provider"
      resultNounPlural="providers"
      showResultCount={showResultCount}
      advancedFiltersId="retention-advanced-filters"
    />
  );
}
