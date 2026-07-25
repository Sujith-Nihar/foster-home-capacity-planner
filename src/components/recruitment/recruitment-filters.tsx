"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { CountySearchInput } from "@/components/operational/county-search-input";
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
  COMPARABLE_COUNTIES,
  RECRUITMENT_ATTENTION_HELP,
  RECRUITMENT_METRICS,
} from "@/content/methodology";
import { useOperationalFilters } from "@/hooks/use-operational-filters";
import { useSyncDraftFromApplied } from "@/hooks/use-sync-draft-from-applied";
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
  title: string;
  titleId: string;
  showResultCount?: boolean;
  totalCount?: number;
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

function hasAdvancedFilters(searchParams: RecruitmentSearchParams): boolean {
  return (
    resolveOutOfCountyPreset(searchParams.minOutOfCountyRate, searchParams.maxOutOfCountyRate) ===
    "custom"
  );
}

function createDraftState(searchParams: RecruitmentSearchParams) {
  return {
    countySearch: searchParams.county ?? "",
    priority: searchParams.priority ?? ALL_FILTER_VALUE,
    ageGroup: searchParams.ageGroup ?? ALL_FILTER_VALUE,
    minFosterChildren: searchParams.minFosterChildren?.toString() ?? "",
    outOfCountyPreset: resolveOutOfCountyPreset(
      searchParams.minOutOfCountyRate,
      searchParams.maxOutOfCountyRate,
    ),
    customMinOutOfCountyPercent: decimalToPercentInput(searchParams.minOutOfCountyRate),
    customMaxOutOfCountyPercent: decimalToPercentInput(searchParams.maxOutOfCountyRate),
    moreFiltersOpen:
      hasAdvancedFilters(searchParams) ||
      resolveOutOfCountyPreset(searchParams.minOutOfCountyRate, searchParams.maxOutOfCountyRate) ===
        "custom",
  };
}

export function RecruitmentFilters({
  filterOptions,
  searchParams,
  exportQuery,
  title,
  titleId,
  showResultCount = true,
  totalCount = 0,
}: RecruitmentFiltersProps) {
  const { navigate, isPending } = useOperationalFilters();
  const [draft, setDraft] = useState(() => createDraftState(searchParams));

  const syncDraft = useCallback((applied: RecruitmentSearchParams) => {
    setDraft(createDraftState(applied));
  }, []);

  useSyncDraftFromApplied(searchParams, syncDraft, (applied) =>
    buildRecruitmentQueryString(applied),
  );

  const selectedPreset = useMemo(
    () => OUT_OF_COUNTY_PRESETS.find((item) => item.value === draft.outOfCountyPreset),
    [draft.outOfCountyPreset],
  );

  const advancedFilterCount = useMemo(() => {
    if (draft.outOfCountyPreset === "custom") {
      return 1;
    }
    return hasAdvancedFilters(searchParams) ? 1 : 0;
  }, [draft.outOfCountyPreset, searchParams]);

  function resolveOutOfCountyRates(): {
    minOutOfCountyRate?: number;
    maxOutOfCountyRate?: number;
  } {
    if (draft.outOfCountyPreset === "custom") {
      return {
        minOutOfCountyRate: percentInputToDecimal(draft.customMinOutOfCountyPercent),
        maxOutOfCountyRate: percentInputToDecimal(draft.customMaxOutOfCountyPercent),
      };
    }

    return {
      minOutOfCountyRate: selectedPreset?.min,
      maxOutOfCountyRate: selectedPreset?.max,
    };
  }

  function buildNextParams(): Partial<RecruitmentSearchParams> &
    Pick<RecruitmentSearchParams, "sort" | "direction"> {
    const outOfCountyRates = resolveOutOfCountyRates();
    const county = draft.countySearch.trim();

    return {
      sort: searchParams.sort,
      direction: searchParams.direction,
      county: county || undefined,
      priority:
        draft.priority !== ALL_FILTER_VALUE
          ? (draft.priority as RecruitmentSearchParams["priority"])
          : undefined,
      ageGroup:
        draft.ageGroup !== ALL_FILTER_VALUE
          ? (draft.ageGroup as RecruitmentSearchParams["ageGroup"])
          : undefined,
      minFosterChildren: draft.minFosterChildren ? Number(draft.minFosterChildren) : undefined,
      ...outOfCountyRates,
    };
  }

  function applyFilters() {
    navigate(buildRecruitmentQueryString(buildNextParams()));
  }

  function clearFilters() {
    setDraft({
      countySearch: "",
      priority: ALL_FILTER_VALUE,
      ageGroup: ALL_FILTER_VALUE,
      minFosterChildren: "",
      outOfCountyPreset: "any",
      customMinOutOfCountyPercent: "",
      customMaxOutOfCountyPercent: "",
      moreFiltersOpen: false,
    });
    navigate(
      buildRecruitmentQueryString({
        sort: searchParams.sort,
        direction: searchParams.direction,
      }),
    );
  }

  return (
    <OperationalFilterPanel
      title={title}
      titleId={titleId}
      description={
        <>
          Eligible counties meeting minimum volume rules for comparative{" "}
          {RECRUITMENT_METRICS.recruitmentAttention.label.toLowerCase()}.{" "}
          {COMPARABLE_COUNTIES.explanation.split(".")[0]}.
          <OperationalMethodologyLink title={RECRUITMENT_ATTENTION_HELP.title}>
            <div>
              <p className="font-medium text-text-primary">Three indicators</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {RECRUITMENT_ATTENTION_HELP.indicators.map((indicator) => (
                  <li key={indicator}>{indicator}</li>
                ))}
              </ul>
            </div>
            <p>
              <span className="font-medium text-text-primary">Comparison group: </span>
              {RECRUITMENT_ATTENTION_HELP.comparisonGroup}
            </p>
            <div>
              <p className="font-medium text-text-primary">Planning rules</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>High: {RECRUITMENT_ATTENTION_HELP.highRule}</li>
                <li>Medium: {RECRUITMENT_ATTENTION_HELP.mediumRule}</li>
              </ul>
            </div>
            <p>{RECRUITMENT_ATTENTION_HELP.caveat}</p>
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
          <OperationalFilterField label="Search county">
            <CountySearchInput
              value={draft.countySearch}
              onValueChange={(value) => setDraft((current) => ({ ...current, countySearch: value }))}
              counties={filterOptions.counties}
              onEnter={applyFilters}
            />
          </OperationalFilterField>

          <OperationalFilterField label="Recruitment attention">
            <Select
              value={draft.priority}
              onValueChange={(value) =>
                setDraft((current) => ({ ...current, priority: value ?? ALL_FILTER_VALUE }))
              }
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
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
          </OperationalFilterField>

          <OperationalFilterField label="Minimum foster-home children">
            <Input
              type="number"
              min={0}
              step={1}
              value={draft.minFosterChildren}
              onChange={(event) =>
                setDraft((current) => ({ ...current, minFosterChildren: event.target.value }))
              }
              placeholder="e.g. 10"
              className={OPERATIONAL_FILTER_CONTROL_CLASS}
            />
          </OperationalFilterField>

          <OperationalFilterField label="Highest-pressure age group">
            <Select
              value={draft.ageGroup}
              onValueChange={(value) =>
                setDraft((current) => ({ ...current, ageGroup: value ?? ALL_FILTER_VALUE }))
              }
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
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
          </OperationalFilterField>

          <OperationalFilterField label="Out-of-county rate">
            <Select
              value={draft.outOfCountyPreset}
              onValueChange={(value) => {
                const next = (value ?? "any") as (typeof OUT_OF_COUNTY_PRESETS)[number]["value"];
                setDraft((current) => ({
                  ...current,
                  outOfCountyPreset: next,
                  moreFiltersOpen: next === "custom" ? true : current.moreFiltersOpen,
                }));
              }}
            >
              <SelectTrigger className={OPERATIONAL_FILTER_CONTROL_CLASS}>
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
          </OperationalFilterField>
        </OperationalFilterGrid>
      }
      advancedFilters={
        <>
          <OperationalFilterField label="Minimum out-of-county rate (%)">
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={draft.customMinOutOfCountyPercent}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  customMinOutOfCountyPercent: event.target.value,
                }))
              }
              placeholder="0%–100%"
              className={OPERATIONAL_FILTER_CONTROL_CLASS}
            />
          </OperationalFilterField>
          <OperationalFilterField label="Maximum out-of-county rate (%)">
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={draft.customMaxOutOfCountyPercent}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  customMaxOutOfCountyPercent: event.target.value,
                }))
              }
              placeholder="0%–100%"
              className={OPERATIONAL_FILTER_CONTROL_CLASS}
            />
          </OperationalFilterField>
        </>
      }
      moreFiltersOpen={draft.moreFiltersOpen}
      onMoreFiltersToggle={() =>
        setDraft((current) => ({ ...current, moreFiltersOpen: !current.moreFiltersOpen }))
      }
      advancedFilterCount={advancedFilterCount}
      onApply={applyFilters}
      onClear={clearFilters}
      exportHref={`/api/exports/recruitment${exportQuery ? `?${exportQuery}` : ""}`}
      isPending={isPending}
      resultCount={totalCount}
      resultNoun="county"
      resultNounPlural="counties"
      showResultCount={showResultCount}
      advancedFiltersId="recruitment-advanced-filters"
    />
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
      scroll={false}
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
