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
import type { FilterOptionsDto } from "@/lib/types/domain";
import { buildRecruitmentQueryString, buildRecruitmentSortHref } from "@/lib/recruitment/query";
import {
  AGE_GROUP_LABELS,
  RECRUITMENT_PRIORITIES,
  type RecruitmentSearchParams,
} from "@/lib/validation/search-params";

type RecruitmentFiltersProps = {
  filterOptions: FilterOptionsDto;
  searchParams: RecruitmentSearchParams;
  exportQuery: string;
};

const ALL_FILTER_VALUE = "all";

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
  const [minOutOfCountyRate, setMinOutOfCountyRate] = useState(
    searchParams.minOutOfCountyRate?.toString() ?? "",
  );
  const [maxOutOfCountyRate, setMaxOutOfCountyRate] = useState(
    searchParams.maxOutOfCountyRate?.toString() ?? "",
  );

  function applyFilters() {
    const nextParams: Partial<RecruitmentSearchParams> & Pick<RecruitmentSearchParams, "sort" | "direction"> = {
      sort: searchParams.sort,
      direction: searchParams.direction,
      priority: priority !== ALL_FILTER_VALUE ? (priority as RecruitmentSearchParams["priority"]) : undefined,
      ageGroup: ageGroup !== ALL_FILTER_VALUE ? (ageGroup as RecruitmentSearchParams["ageGroup"]) : undefined,
      minFosterChildren: minFosterChildren ? Number(minFosterChildren) : undefined,
      minOutOfCountyRate: minOutOfCountyRate ? Number(minOutOfCountyRate) : undefined,
      maxOutOfCountyRate: maxOutOfCountyRate ? Number(maxOutOfCountyRate) : undefined,
    };

    startTransition(() => {
      router.push(`/recruitment${buildRecruitmentQueryString(nextParams)}`);
    });
  }

  function clearFilters() {
    setPriority(ALL_FILTER_VALUE);
    setAgeGroup(ALL_FILTER_VALUE);
    setMinFosterChildren("");
    setMinOutOfCountyRate("");
    setMaxOutOfCountyRate("");
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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <span className="font-medium text-text-primary">Minimum out-of-county rate</span>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={minOutOfCountyRate}
          onChange={(event) => setMinOutOfCountyRate(event.target.value)}
          placeholder="0.00–1.00"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-text-primary">Maximum out-of-county rate</span>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={maxOutOfCountyRate}
          onChange={(event) => setMaxOutOfCountyRate(event.target.value)}
          placeholder="0.00–1.00"
        />
      </label>

      <div className="flex flex-wrap items-end gap-2">
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
      className="inline-flex items-center gap-1 font-medium text-text-primary hover:underline"
    >
      {label}
      <Icon className="size-3.5 text-text-tertiary" aria-hidden="true" />
      {isActive ? <span className="sr-only">sorted {searchParams.direction}</span> : null}
    </Link>
  );
}
