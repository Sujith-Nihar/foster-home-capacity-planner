"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";

import { ActiveFilterChips } from "@/components/retention/active-filter-chips";
import { AdvancedFilterSheet } from "@/components/retention/advanced-filter-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildRetentionQueryString } from "@/lib/retention/query";
import type { FilterOptionsDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";
import {
  OUTREACH_PRIORITIES,
  RETENTION_ACTIVITY_FILTERS,
  type RetentionSearchParams,
} from "@/lib/validation/search-params";

type RetentionFilterToolbarProps = {
  filterOptions: FilterOptionsDto;
  searchParams: RetentionSearchParams;
  exportQuery: string;
  totalCount: number;
};

const ALL_FILTER_VALUE = "all";

const ACTIVITY_LABELS: Record<(typeof RETENTION_ACTIVITY_FILTERS)[number], string> = {
  all: "All providers",
  active: "Currently active",
  inactive: "Currently inactive",
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

export function RetentionFilterToolbar({
  filterOptions,
  searchParams,
  exportQuery,
  totalCount,
}: RetentionFilterToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [providerId, setProviderId] = useState(searchParams.providerId?.toString() ?? "");
  const [county, setCounty] = useState(searchParams.county ?? ALL_FILTER_VALUE);
  const [priority, setPriority] = useState(searchParams.priority ?? ALL_FILTER_VALUE);
  const [activity, setActivity] = useState(searchParams.activity);
  const [expiration, setExpiration] = useState(searchParams.expiration);
  const [minInactivityDays, setMinInactivityDays] = useState(
    searchParams.minInactivityDays?.toString() ?? "",
  );
  const [minEngagementPercent, setMinEngagementPercent] = useState(
    decimalToPercent(searchParams.minEngagement),
  );
  const [maxEngagementPercent, setMaxEngagementPercent] = useState(
    decimalToPercent(searchParams.maxEngagement),
  );
  const [minAge, setMinAge] = useState(searchParams.minAge?.toString() ?? "");
  const [maxAge, setMaxAge] = useState(searchParams.maxAge?.toString() ?? "");

  function buildNextParams(): Partial<RetentionSearchParams> &
    Pick<RetentionSearchParams, "sort" | "direction"> {
    return {
      sort: searchParams.sort,
      direction: searchParams.direction,
      page: 1,
      providerId: providerId ? Number(providerId) : undefined,
      county: county !== ALL_FILTER_VALUE ? county : undefined,
      priority:
        priority !== ALL_FILTER_VALUE
          ? (priority as RetentionSearchParams["priority"])
          : undefined,
      activity,
      expiration,
      minInactivityDays: minInactivityDays ? Number(minInactivityDays) : undefined,
      minEngagement: percentToDecimal(minEngagementPercent),
      maxEngagement: percentToDecimal(maxEngagementPercent),
      minAge: minAge ? Number(minAge) : undefined,
      maxAge: maxAge ? Number(maxAge) : undefined,
    };
  }

  function applyFilters() {
    startTransition(() => {
      router.push(`/retention${buildRetentionQueryString(buildNextParams())}`);
    });
  }

  function clearFilters() {
    setProviderId("");
    setCounty(ALL_FILTER_VALUE);
    setPriority(ALL_FILTER_VALUE);
    setActivity("all");
    setExpiration("all");
    setMinInactivityDays("");
    setMinEngagementPercent("");
    setMaxEngagementPercent("");
    setMinAge("");
    setMaxAge("");

    startTransition(() => {
      router.push(
        `/retention${buildRetentionQueryString({
          sort: searchParams.sort,
          direction: searchParams.direction,
        })}`,
      );
    });
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
    if (searchParams.expiration !== "all") count += 1;
    if (searchParams.minInactivityDays !== undefined) count += 1;
    if (searchParams.minEngagement !== undefined || searchParams.maxEngagement !== undefined) {
      count += 1;
    }
    if (searchParams.minAge !== undefined || searchParams.maxAge !== undefined) count += 1;
    return count;
  }, [searchParams]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[140px] flex-1 space-y-1.5 text-sm">
            <span className="text-xs font-medium text-text-secondary">Provider search</span>
            <Input
              type="number"
              min={1}
              step={1}
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
              placeholder="Provider ID"
              className="h-9"
            />
          </label>

          <label className="min-w-[140px] flex-1 space-y-1.5 text-sm">
            <span className="text-xs font-medium text-text-secondary">County</span>
            <Select value={county} onValueChange={(value) => setCounty(value ?? ALL_FILTER_VALUE)}>
              <SelectTrigger className="h-9 w-full">
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
          </label>

          <label className="min-w-[140px] flex-1 space-y-1.5 text-sm">
            <span className="text-xs font-medium text-text-secondary">Outreach priority</span>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value ?? ALL_FILTER_VALUE)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>All priorities</SelectItem>
                {OUTREACH_PRIORITIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="min-w-[140px] flex-1 space-y-1.5 text-sm">
            <span className="text-xs font-medium text-text-secondary">Current activity</span>
            <Select
              value={activity}
              onValueChange={(value) =>
                setActivity((value ?? "all") as RetentionSearchParams["activity"])
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="All providers" />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_ACTIVITY_FILTERS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {ACTIVITY_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setAdvancedOpen(true)}
            >
              <SlidersHorizontal className="size-3.5" aria-hidden="true" />
              More filters
              {advancedFilterCount > 0 ? (
                <span className="ml-1 rounded-full bg-brand-blue-soft px-1.5 text-xs font-medium text-brand-navy">
                  {advancedFilterCount}
                </span>
              ) : null}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9"
              onClick={applyFilters}
              disabled={isPending}
            >
              Apply
            </Button>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={clearFilters}
                disabled={isPending}
              >
                Clear
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9"
              nativeButton={false}
              render={
                <Link
                  href={`/api/exports/retention${exportQuery ? `?${exportQuery}` : ""}`}
                  prefetch={false}
                />
              }
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-secondary">
          <p>
            <span className="font-medium text-text-primary">{formatCount(totalCount)}</span>{" "}
            {totalCount === 1 ? "provider" : "providers"} match
          </p>
        </div>
      </div>

      {hasActiveFilters ? (
        <ActiveFilterChips
          searchParams={searchParams}
          filterOptions={filterOptions}
          onClearAll={clearFilters}
        />
      ) : null}

      <AdvancedFilterSheet
        open={advancedOpen}
        onOpenChange={setAdvancedOpen}
        expiration={expiration}
        onExpirationChange={setExpiration}
        minInactivityDays={minInactivityDays}
        onMinInactivityDaysChange={setMinInactivityDays}
        minEngagementPercent={minEngagementPercent}
        onMinEngagementPercentChange={setMinEngagementPercent}
        maxEngagementPercent={maxEngagementPercent}
        onMaxEngagementPercentChange={setMaxEngagementPercent}
        minAge={minAge}
        onMinAgeChange={setMinAge}
        maxAge={maxAge}
        onMaxAgeChange={setMaxAge}
        onApply={() => {
          applyFilters();
          setAdvancedOpen(false);
        }}
        onClear={clearFilters}
      />
    </div>
  );
}
