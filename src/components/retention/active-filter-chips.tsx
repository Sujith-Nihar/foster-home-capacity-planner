"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildRetentionQueryString } from "@/lib/retention/query";
import type { FilterOptionsDto } from "@/lib/types/domain";
import type { RetentionSearchParams } from "@/lib/validation/search-params";
import { useOperationalFilters } from "@/hooks/use-operational-filters";

type ActiveFilterChipsProps = {
  searchParams: RetentionSearchParams;
  filterOptions: FilterOptionsDto;
  onClearAll: () => void;
};

const EXPIRATION_LABELS: Record<string, string> = {
  within_30: "Within 30 days",
  within_60: "Within 60 days",
  within_90: "Within 90 days",
  within_180: "Within 180 days",
};

const ACTIVITY_LABELS: Record<string, string> = {
  active: "Has a current placement",
  inactive: "No current placement",
};

const PRIORITY_CHIP_LABELS: Record<string, string> = {
  High: "High outreach",
  Medium: "Medium outreach",
  Low: "Low outreach",
};

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function ActiveFilterChips({
  searchParams,
  onClearAll,
}: ActiveFilterChipsProps) {
  const { navigate, isPending } = useOperationalFilters();

  const chips: Array<{ key: string; label: string; removeParams: Partial<RetentionSearchParams> }> =
    [];

  if (searchParams.providerId) {
    chips.push({
      key: "providerId",
      label: `Provider ${searchParams.providerId}`,
      removeParams: { providerId: undefined },
    });
  }

  if (searchParams.county) {
    chips.push({
      key: "county",
      label: searchParams.county,
      removeParams: { county: undefined },
    });
  }

  if (searchParams.priority) {
    chips.push({
      key: "priority",
      label: PRIORITY_CHIP_LABELS[searchParams.priority] ?? searchParams.priority,
      removeParams: { priority: undefined },
    });
  }

  if (searchParams.activity !== "all") {
    chips.push({
      key: "activity",
      label: ACTIVITY_LABELS[searchParams.activity] ?? searchParams.activity,
      removeParams: { activity: "all" },
    });
  }

  if (searchParams.expiration !== "all") {
    chips.push({
      key: "expiration",
      label: EXPIRATION_LABELS[searchParams.expiration] ?? searchParams.expiration,
      removeParams: { expiration: "all" },
    });
  }

  if (searchParams.minInactivityDays !== undefined) {
    chips.push({
      key: "minInactivityDays",
      label: `≥ ${searchParams.minInactivityDays} days inactive`,
      removeParams: { minInactivityDays: undefined },
    });
  }

  if (
    searchParams.minEngagement !== undefined ||
    searchParams.maxEngagement !== undefined
  ) {
    const min = searchParams.minEngagement !== undefined
      ? formatPercent(searchParams.minEngagement)
      : "0%";
    const max = searchParams.maxEngagement !== undefined
      ? formatPercent(searchParams.maxEngagement)
      : "100%";
    chips.push({
      key: "engagement",
      label: `Placement activity ${min}–${max}`,
      removeParams: { minEngagement: undefined, maxEngagement: undefined },
    });
  }

  if (searchParams.minAge !== undefined || searchParams.maxAge !== undefined) {
    const min = searchParams.minAge ?? 0;
    const max = searchParams.maxAge ?? 21;
    chips.push({
      key: "age",
      label: `Ages ${min}–${max}`,
      removeParams: { minAge: undefined, maxAge: undefined },
    });
  }

  function removeChip(removeParams: Partial<RetentionSearchParams>) {
    const nextParams: RetentionSearchParams = {
      ...searchParams,
      ...removeParams,
      page: 1,
    };

    navigate(buildRetentionQueryString(nextParams));
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          disabled={isPending}
          onClick={() => removeChip(chip.removeParams)}
          className="inline-flex items-center gap-1 rounded-full border border-border-default bg-surface-raised px-2.5 py-1 text-xs font-medium text-text-primary transition-colors hover:bg-surface-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {chip.label}
          <X className="size-3 text-text-tertiary" aria-hidden="true" />
          <span className="sr-only">Remove {chip.label} filter</span>
        </button>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={onClearAll}
        disabled={isPending}
      >
        Clear all
      </Button>
    </div>
  );
}
