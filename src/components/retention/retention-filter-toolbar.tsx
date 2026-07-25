"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ActiveFilterChips } from "@/components/retention/active-filter-chips";
import {
  OperationalFilterField,
  OperationalFilterGrid,
  OperationalFilterPanel,
  OPERATIONAL_FILTER_CONTROL_CLASS,
} from "@/components/operational/operational-filter-panel";
import { OperationalMethodologyLink } from "@/components/operational/operational-methodology-link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RETENTION_METRICS,
  RETENTION_OUTREACH_HELP,
  RETENTION_OUTREACH_RULES,
} from "@/content/methodology";
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
  totalCount: number;
  title: string;
  titleId: string;
};

const ALL_FILTER_VALUE = "all";

const ACTIVITY_LABELS: Record<(typeof RETENTION_ACTIVITY_FILTERS)[number], string> = {
  all: "All providers",
  active: "Currently active",
  inactive: "Currently inactive",
};

const EXPIRATION_LABELS: Record<(typeof RETENTION_EXPIRATION_FILTERS)[number], string> = {
  all: "Any expiration window",
  within_30: "Within 30 days",
  within_60: "Within 60 days",
  within_90: "Within 90 days",
  within_180: "Within 180 days",
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
    searchParams.expiration !== "all" ||
    searchParams.minInactivityDays !== undefined ||
    searchParams.minEngagement !== undefined ||
    searchParams.maxEngagement !== undefined ||
    searchParams.minAge !== undefined ||
    searchParams.maxAge !== undefined
  );
}

export function RetentionFilterToolbar({
  filterOptions,
  searchParams,
  exportQuery,
  totalCount,
  title,
  titleId,
}: RetentionFilterToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(hasAdvancedFilters(searchParams));

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
    setMoreFiltersOpen(false);

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
    <OperationalFilterPanel
      title={title}
      titleId={titleId}
      description={
        <>
          Review licensed providers by {RETENTION_METRICS.outreachPriority.label.toLowerCase()},
          placement activity, and license timing.
          <OperationalMethodologyLink title={RETENTION_OUTREACH_HELP.title}>
            <p>{RETENTION_OUTREACH_HELP.explanation}</p>
            <div>
              <p className="font-medium text-text-primary">High outreach</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {RETENTION_OUTREACH_RULES.high.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-text-primary">Medium outreach</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {RETENTION_OUTREACH_RULES.medium.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
            <p>{RETENTION_METRICS.outreachPriority.limitation}</p>
            <Link
              href="/methodology#prototype-planning-rules"
              className="inline-flex font-medium text-brand-navy underline-offset-4 hover:underline"
            >
              View full methodology
            </Link>
          </OperationalMethodologyLink>
        </>
      }
      primaryFilters={
        <OperationalFilterGrid>
          <OperationalFilterField label="Provider search">
            <Input
              type="search"
              inputMode="numeric"
              value={providerId}
              onChange={(event) => setProviderId(event.target.value.replace(/\D/g, ""))}
              placeholder="Provider ID"
              className={OPERATIONAL_FILTER_CONTROL_CLASS}
            />
          </OperationalFilterField>

          <OperationalFilterField label="County">
            <Select value={county} onValueChange={(value) => setCounty(value ?? ALL_FILTER_VALUE)}>
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

          <OperationalFilterField label="Outreach priority">
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value ?? ALL_FILTER_VALUE)}
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
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
          </OperationalFilterField>

          <OperationalFilterField label="Current activity">
            <Select
              value={activity}
              onValueChange={(value) =>
                setActivity((value ?? "all") as RetentionSearchParams["activity"])
              }
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
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
          </OperationalFilterField>
        </OperationalFilterGrid>
      }
      advancedFilters={
        <>
          <OperationalFilterField label="License expiration window">
            <Select
              value={expiration}
              onValueChange={(value) =>
                setExpiration((value ?? "all") as RetentionSearchParams["expiration"])
              }
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
                <SelectValue placeholder="Any expiration window" />
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

          <OperationalFilterField label="Minimum days since last placement">
            <Input
              type="number"
              min={0}
              step={1}
              value={minInactivityDays}
              onChange={(event) => setMinInactivityDays(event.target.value)}
              placeholder="e.g. 90"
              className={OPERATIONAL_FILTER_CONTROL_CLASS}
            />
          </OperationalFilterField>

          <OperationalFilterField label="Engagement rate range (%)">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={minEngagementPercent}
                onChange={(event) => setMinEngagementPercent(event.target.value)}
                placeholder="Min %"
                aria-label="Minimum engagement rate percent"
                className={OPERATIONAL_FILTER_CONTROL_CLASS}
              />
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={maxEngagementPercent}
                onChange={(event) => setMaxEngagementPercent(event.target.value)}
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
                value={minAge}
                onChange={(event) => setMinAge(event.target.value)}
                placeholder="Min age"
                aria-label="Minimum preferred child age"
                className={OPERATIONAL_FILTER_CONTROL_CLASS}
              />
              <Input
                type="number"
                min={0}
                max={21}
                step={1}
                value={maxAge}
                onChange={(event) => setMaxAge(event.target.value)}
                placeholder="Max age"
                aria-label="Maximum preferred child age"
                className={OPERATIONAL_FILTER_CONTROL_CLASS}
              />
            </div>
          </OperationalFilterField>
        </>
      }
      moreFiltersOpen={moreFiltersOpen}
      onMoreFiltersToggle={() => setMoreFiltersOpen((open) => !open)}
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
      advancedFiltersId="retention-advanced-filters"
    />
  );
}
