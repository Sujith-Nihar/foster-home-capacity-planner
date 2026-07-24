"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterOptionsDto } from "@/lib/types/domain";
import { buildRecruitmentQueryString, buildRecruitmentSortHref } from "@/lib/recruitment/query";
import {
  AGE_GROUP_LABELS,
  RECRUITMENT_PRIORITIES,
  type RecruitmentSearchParams,
} from "@/lib/validation/search-params";
import { cn } from "@/lib/utils";

type RecruitmentFiltersProps = {
  filterOptions: FilterOptionsDto;
  searchParams: RecruitmentSearchParams;
  exportQuery: string;
};

const ALL_FILTER_VALUE = "all";

const OUT_OF_COUNTY_PRESETS = [
  { value: "any", label: "Any rate", min: undefined, max: undefined },
  { value: "25", label: "25% or higher", min: 0.25, max: undefined },
  { value: "50", label: "50% or higher", min: 0.5, max: undefined },
  { value: "75", label: "75% or higher", min: 0.75, max: undefined },
  { value: "custom", label: "Custom range", min: undefined, max: undefined },
] as const;

function decimalToPercentInput(value: number | undefined): string {
  if (value === undefined) {
    return "";
  }
  return String(Math.round(value * 1000) / 10);
}

function percentInputToDecimal(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return Math.min(100, Math.max(0, parsed)) / 100;
}

function resolveOutOfCountyPreset(
  minOutOfCountyRate?: number,
  maxOutOfCountyRate?: number,
): (typeof OUT_OF_COUNTY_PRESETS)[number]["value"] {
  if (minOutOfCountyRate === undefined && maxOutOfCountyRate === undefined) {
    return "any";
  }

  const preset = OUT_OF_COUNTY_PRESETS.find(
    (item) =>
      item.value !== "custom" &&
      item.value !== "any" &&
      item.min === minOutOfCountyRate &&
      maxOutOfCountyRate === undefined,
  );

  return preset?.value ?? "custom";
}

export function RecruitmentFilters({
  filterOptions,
  searchParams,
  exportQuery,
}: RecruitmentFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [priority, setPriority] = useState(searchParams.priority ?? ALL_FILTER_VALUE);
  const [ageGroup, setAgeGroup] = useState(searchParams.ageGroup ?? ALL_FILTER_VALUE);
  const [minFosterChildren, setMinFosterChildren] = useState(
    searchParams.minFosterChildren?.toString() ?? "",
  );
  const [outOfCountyPreset, setOutOfCountyPreset] = useState(
    resolveOutOfCountyPreset(searchParams.minOutOfCountyRate, searchParams.maxOutOfCountyRate),
  );
  const [customMinOutOfCountyPercent, setCustomMinOutOfCountyPercent] = useState(
    decimalToPercentInput(searchParams.minOutOfCountyRate),
  );
  const [customMaxOutOfCountyPercent, setCustomMaxOutOfCountyPercent] = useState(
    decimalToPercentInput(searchParams.maxOutOfCountyRate),
  );
  const [showMoreFilters, setShowMoreFilters] = useState(
    resolveOutOfCountyPreset(searchParams.minOutOfCountyRate, searchParams.maxOutOfCountyRate) ===
      "custom",
  );

  const selectedPreset = useMemo(
    () => OUT_OF_COUNTY_PRESETS.find((item) => item.value === outOfCountyPreset),
    [outOfCountyPreset],
  );

  function resolveOutOfCountyRates(): {
    minOutOfCountyRate?: number;
    maxOutOfCountyRate?: number;
  } {
    if (outOfCountyPreset === "custom") {
      return {
        minOutOfCountyRate: percentInputToDecimal(customMinOutOfCountyPercent),
        maxOutOfCountyRate: percentInputToDecimal(customMaxOutOfCountyPercent),
      };
    }

    return {
      minOutOfCountyRate: selectedPreset?.min,
      maxOutOfCountyRate: selectedPreset?.max,
    };
  }

  function applyFilters() {
    const outOfCountyRates = resolveOutOfCountyRates();
    const nextParams: Partial<RecruitmentSearchParams> & Pick<RecruitmentSearchParams, "sort" | "direction"> = {
      sort: searchParams.sort,
      direction: searchParams.direction,
      priority: priority !== ALL_FILTER_VALUE ? (priority as RecruitmentSearchParams["priority"]) : undefined,
      ageGroup: ageGroup !== ALL_FILTER_VALUE ? (ageGroup as RecruitmentSearchParams["ageGroup"]) : undefined,
      minFosterChildren: minFosterChildren ? Number(minFosterChildren) : undefined,
      ...outOfCountyRates,
    };

    startTransition(() => {
      router.push(`/recruitment${buildRecruitmentQueryString(nextParams)}`);
    });
  }

  function clearFilters() {
    setPriority(ALL_FILTER_VALUE);
    setAgeGroup(ALL_FILTER_VALUE);
    setMinFosterChildren("");
    setOutOfCountyPreset("any");
    setCustomMinOutOfCountyPercent("");
    setCustomMaxOutOfCountyPercent("");
    setShowMoreFilters(false);
    startTransition(() => {
      router.push(
        `/recruitment${buildRecruitmentQueryString({
          sort: searchParams.sort,
          direction: searchParams.direction,
        })}`,
      );
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-text-primary">Recruitment priority</span>
          <Select value={priority} onValueChange={(value) => setPriority(value ?? ALL_FILTER_VALUE)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>All priorities</SelectItem>
              {RECRUITMENT_PRIORITIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-text-primary">Minimum foster-home children</span>
          <Input
            type="number"
            min={0}
            step={1}
            value={minFosterChildren}
            onChange={(event) => setMinFosterChildren(event.target.value)}
            placeholder="e.g. 10"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-text-primary">Highest-pressure age group</span>
          <Select value={ageGroup} onValueChange={(value) => setAgeGroup(value ?? ALL_FILTER_VALUE)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All age groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>All age groups</SelectItem>
              {(filterOptions.ageGroups.length > 0 ? filterOptions.ageGroups : AGE_GROUP_LABELS).map(
                (item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-text-primary">Out-of-county rate</span>
          <Select
            value={outOfCountyPreset}
            onValueChange={(value) => {
              const next = (value ?? "any") as (typeof OUT_OF_COUNTY_PRESETS)[number]["value"];
              setOutOfCountyPreset(next);
              setShowMoreFilters(next === "custom");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any rate" />
            </SelectTrigger>
            <SelectContent>
              {OUT_OF_COUNTY_PRESETS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      {showMoreFilters || outOfCountyPreset === "custom" ? (
        <div className="grid gap-4 rounded-xl border border-border-subtle bg-surface-tint/30 p-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-text-primary">Minimum out-of-county rate (%)</span>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={customMinOutOfCountyPercent}
              onChange={(event) => setCustomMinOutOfCountyPercent(event.target.value)}
              placeholder="0%–100%"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-text-primary">Maximum out-of-county rate (%)</span>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={customMaxOutOfCountyPercent}
              onChange={(event) => setCustomMaxOutOfCountyPercent(event.target.value)}
              placeholder="0%–100%"
            />
          </label>
        </div>
      ) : (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-navy hover:underline"
          onClick={() => setShowMoreFilters(true)}
        >
          More filters
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2">
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
              href={`/api/exports/recruitment${exportQuery ? `?${exportQuery}` : ""}`}
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
  sortKey: RecruitmentSearchParams["sort"];
  searchParams: RecruitmentSearchParams;
};

export function RecruitmentSortHeader({ label, sortKey, searchParams }: SortHeaderProps) {
  const isActive = searchParams.sort === sortKey;
  const Icon = !isActive ? ArrowUpDown : searchParams.direction === "asc" ? ArrowUp : ArrowDown;
  const href = buildRecruitmentSortHref(searchParams, sortKey);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 font-medium text-text-primary hover:underline",
      )}
    >
      {label}
      <Icon className="size-3.5 text-text-tertiary" aria-hidden="true" />
      {isActive ? <span className="sr-only">sorted {searchParams.direction}</span> : null}
    </Link>
  );
}
