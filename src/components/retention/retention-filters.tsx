"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildRetentionQueryString, buildRetentionSortHref } from "@/lib/retention/query";
import type { FilterOptionsDto } from "@/lib/types/domain";
import {
  OUTREACH_PRIORITIES,
  RETENTION_ACTIVITY_FILTERS,
  RETENTION_EXPIRATION_FILTERS,
  type RetentionSearchParams,
} from "@/lib/validation/search-params";

type RetentionFiltersProps = {
  filterOptions: FilterOptionsDto;
  searchParams: RetentionSearchParams;
  exportQuery: string;
};

const ALL_FILTER_VALUE = "all";

const EXPIRATION_LABELS: Record<(typeof RETENTION_EXPIRATION_FILTERS)[number], string> = {
  all: "Any expiration window",
  within_30: "Within 30 days",
  within_60: "Within 60 days",
  within_90: "Within 90 days",
  within_180: "Within 180 days",
};

const ACTIVITY_LABELS: Record<(typeof RETENTION_ACTIVITY_FILTERS)[number], string> = {
  all: "All providers",
  active: "Currently active",
  inactive: "Currently inactive",
};

export function RetentionFilters({
  filterOptions,
  searchParams,
  exportQuery,
}: RetentionFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [providerId, setProviderId] = useState(searchParams.providerId?.toString() ?? "");
  const [county, setCounty] = useState(searchParams.county ?? ALL_FILTER_VALUE);
  const [priority, setPriority] = useState(searchParams.priority ?? ALL_FILTER_VALUE);
  const [activity, setActivity] = useState(searchParams.activity);
  const [expiration, setExpiration] = useState(searchParams.expiration);
  const [minInactivityDays, setMinInactivityDays] = useState(
    searchParams.minInactivityDays?.toString() ?? "",
  );
  const [minEngagement, setMinEngagement] = useState(searchParams.minEngagement?.toString() ?? "");
  const [maxEngagement, setMaxEngagement] = useState(searchParams.maxEngagement?.toString() ?? "");
  const [minAge, setMinAge] = useState(searchParams.minAge?.toString() ?? "");
  const [maxAge, setMaxAge] = useState(searchParams.maxAge?.toString() ?? "");

  function applyFilters() {
    const nextParams: Partial<RetentionSearchParams> &
      Pick<RetentionSearchParams, "sort" | "direction"> = {
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
      minEngagement: minEngagement ? Number(minEngagement) : undefined,
      maxEngagement: maxEngagement ? Number(maxEngagement) : undefined,
      minAge: minAge ? Number(minAge) : undefined,
      maxAge: maxAge ? Number(maxAge) : undefined,
    };

    startTransition(() => {
      router.push(`/retention${buildRetentionQueryString(nextParams)}`);
    });
  }

  function clearFilters() {
    setProviderId("");
    setCounty(ALL_FILTER_VALUE);
    setPriority(ALL_FILTER_VALUE);
    setActivity("all");
    setExpiration("all");
    setMinInactivityDays("");
    setMinEngagement("");
    setMaxEngagement("");
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

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">Provider ID</span>
        <Input
          type="number"
          min={1}
          step={1}
          value={providerId}
          onChange={(event) => setProviderId(event.target.value)}
          placeholder="e.g. 500001"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">County</span>
        <Select value={county} onValueChange={(value) => setCounty(value ?? ALL_FILTER_VALUE)}>
          <SelectTrigger className="w-full">
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

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">Outreach priority</span>
        <Select value={priority} onValueChange={(value) => setPriority(value ?? ALL_FILTER_VALUE)}>
          <SelectTrigger className="w-full">
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

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">Current activity</span>
        <Select
          value={activity}
          onValueChange={(value) =>
            setActivity((value ?? "all") as RetentionSearchParams["activity"])
          }
        >
          <SelectTrigger className="w-full">
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

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">License expiration window</span>
        <Select
          value={expiration}
          onValueChange={(value) =>
            setExpiration((value ?? "all") as RetentionSearchParams["expiration"])
          }
        >
          <SelectTrigger className="w-full">
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
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">Minimum days since last placement</span>
        <Input
          type="number"
          min={0}
          step={1}
          value={minInactivityDays}
          onChange={(event) => setMinInactivityDays(event.target.value)}
          placeholder="e.g. 90"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">Minimum engagement rate</span>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={minEngagement}
          onChange={(event) => setMinEngagement(event.target.value)}
          placeholder="0.00–1.00"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">Maximum engagement rate</span>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={maxEngagement}
          onChange={(event) => setMaxEngagement(event.target.value)}
          placeholder="0.00–1.00"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">Preferred minimum child age</span>
        <Input
          type="number"
          min={0}
          max={21}
          step={1}
          value={minAge}
          onChange={(event) => setMinAge(event.target.value)}
          placeholder="e.g. 0"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">Preferred maximum child age</span>
        <Input
          type="number"
          min={0}
          max={21}
          step={1}
          value={maxAge}
          onChange={(event) => setMaxAge(event.target.value)}
          placeholder="e.g. 17"
        />
      </label>

      <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-3">
        <Button type="button" onClick={applyFilters} disabled={isPending}>
          Apply filters
        </Button>
        <Button type="button" variant="outline" onClick={clearFilters} disabled={isPending}>
          Clear filters
        </Button>
        <Button
          type="button"
          variant="secondary"
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
  );
}

type SortHeaderProps = {
  label: string;
  sortKey: RetentionSearchParams["sort"];
  searchParams: RetentionSearchParams;
};

export function RetentionSortHeader({ label, sortKey, searchParams }: SortHeaderProps) {
  const isActive = searchParams.sort === sortKey;
  const Icon = !isActive ? ArrowUpDown : searchParams.direction === "asc" ? ArrowUp : ArrowDown;
  const href = buildRetentionSortHref(searchParams, sortKey);

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 font-medium text-text-primary hover:underline"
    >
      {label}
      <Icon className="size-3.5 text-text-tertiary" aria-hidden="true" />
      {isActive ? <span className="sr-only">sorted {searchParams.direction}</span> : null}
    </Link>
  );
}
