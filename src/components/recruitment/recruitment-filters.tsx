"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

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
  totalCount: number;
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

export function RecruitmentFilters({
  filterOptions,
  searchParams,
  exportQuery,
  title,
  titleId,
  totalCount,
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
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(
    hasAdvancedFilters(searchParams) || outOfCountyPreset === "custom",
  );

  const selectedPreset = useMemo(
    () => OUT_OF_COUNTY_PRESETS.find((item) => item.value === outOfCountyPreset),
    [outOfCountyPreset],
  );

  const advancedFilterCount = useMemo(() => {
    if (outOfCountyPreset === "custom") {
      return 1;
    }
    return hasAdvancedFilters(searchParams) ? 1 : 0;
  }, [outOfCountyPreset, searchParams]);

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
    setMoreFiltersOpen(false);
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
          <OperationalFilterField label="Recruitment priority">
            <Select value={priority} onValueChange={(value) => setPriority(value ?? ALL_FILTER_VALUE)}>
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
              value={minFosterChildren}
              onChange={(event) => setMinFosterChildren(event.target.value)}
              placeholder="e.g. 10"
              className={OPERATIONAL_FILTER_CONTROL_CLASS}
            />
          </OperationalFilterField>

          <OperationalFilterField label="Highest-pressure age group">
            <Select value={ageGroup} onValueChange={(value) => setAgeGroup(value ?? ALL_FILTER_VALUE)}>
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
              value={outOfCountyPreset}
              onValueChange={(value) => {
                const next = (value ?? "any") as (typeof OUT_OF_COUNTY_PRESETS)[number]["value"];
                setOutOfCountyPreset(next);
                if (next === "custom") {
                  setMoreFiltersOpen(true);
                }
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
              value={customMinOutOfCountyPercent}
              onChange={(event) => setCustomMinOutOfCountyPercent(event.target.value)}
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
              value={customMaxOutOfCountyPercent}
              onChange={(event) => setCustomMaxOutOfCountyPercent(event.target.value)}
              placeholder="0%–100%"
              className={OPERATIONAL_FILTER_CONTROL_CLASS}
            />
          </OperationalFilterField>
        </>
      }
      moreFiltersOpen={moreFiltersOpen}
      onMoreFiltersToggle={() => setMoreFiltersOpen((open) => !open)}
      advancedFilterCount={advancedFilterCount}
      onApply={applyFilters}
      onClear={clearFilters}
      exportHref={`/api/exports/recruitment${exportQuery ? `?${exportQuery}` : ""}`}
      isPending={isPending}
      resultCount={totalCount}
      resultNoun="county"
      resultNounPlural="counties"
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
