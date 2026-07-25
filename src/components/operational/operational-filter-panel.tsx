"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/utils/formatters";

export const OPERATIONAL_FILTER_CONTROL_CLASS = "operational-filter-control";

type OperationalFilterFieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

export function OperationalFilterField({
  label,
  htmlFor,
  children,
  className,
}: OperationalFilterFieldProps) {
  return (
    <label className={cn("operational-filter-field", className)} htmlFor={htmlFor}>
      <span className="operational-filter-field__label">{label}</span>
      {children}
    </label>
  );
}

export function OperationalFilterGrid({ children }: { children: ReactNode }) {
  return <div className="operational-filter-grid">{children}</div>;
}

type OperationalFilterPanelProps = {
  title: string;
  titleId?: string;
  description: ReactNode;
  primaryFilters: ReactNode;
  advancedFilters?: ReactNode;
  moreFiltersOpen: boolean;
  onMoreFiltersToggle: () => void;
  advancedFilterCount?: number;
  activeFilterChips?: ReactNode;
  onApply: () => void;
  onClear: () => void;
  exportHref: string;
  isPending?: boolean;
  resultCount: number;
  resultNoun: string;
  resultNounPlural: string;
  advancedFiltersId?: string;
  showMoreFiltersButton?: boolean;
  showResultCount?: boolean;
};

export function OperationalFilterPanel({
  title,
  titleId,
  description,
  primaryFilters,
  advancedFilters,
  moreFiltersOpen,
  onMoreFiltersToggle,
  advancedFilterCount = 0,
  activeFilterChips,
  onApply,
  onClear,
  exportHref,
  isPending = false,
  resultCount,
  resultNoun,
  resultNounPlural,
  advancedFiltersId = "operational-advanced-filters",
  showMoreFiltersButton = true,
  showResultCount = true,
}: OperationalFilterPanelProps) {
  const resultLabel = resultCount === 1 ? resultNoun : resultNounPlural;
  const matchLabel = resultCount === 1 ? "matches" : "match";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      onApply();
    }
  }

  return (
    <div className="operational-filter-panel">
      <h2 id={titleId} className="operational-filter-panel__title">
        {title}
      </h2>
      <div className="operational-filter-panel__description">{description}</div>

      <form className="operational-filter-panel__controls" onSubmit={handleSubmit}>
        {primaryFilters}

        {showMoreFiltersButton && advancedFilters ? (
          <div className="operational-filter-actions">
            <div className="operational-filter-actions__left">
              <button
                type="button"
                className="operational-filter-btn operational-filter-btn--more"
                aria-expanded={moreFiltersOpen}
                aria-controls={advancedFiltersId}
                onClick={onMoreFiltersToggle}
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                More filters
                {advancedFilterCount > 0 ? (
                  <span className="rounded-full bg-brand-blue-soft px-1.5 text-xs font-medium text-brand-navy">
                    {advancedFilterCount}
                  </span>
                ) : null}
                {moreFiltersOpen ? (
                  <ChevronUp className="size-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="size-4" aria-hidden="true" />
                )}
              </button>
              {activeFilterChips}
            </div>

            <div className="operational-filter-actions__right">
              <button
                type="submit"
                className="operational-filter-btn operational-filter-btn--apply"
                disabled={isPending}
                aria-busy={isPending || undefined}
                onMouseDown={(event) => event.preventDefault()}
              >
                {isPending ? "Applying…" : "Apply filters"}
              </button>
              <button
                type="button"
                className="operational-filter-btn operational-filter-btn--clear"
                onClick={onClear}
                disabled={isPending}
                onMouseDown={(event) => event.preventDefault()}
              >
                Clear filters
              </button>
              <Link
                href={exportHref}
                prefetch={false}
                className="operational-filter-btn operational-filter-btn--export"
              >
                Export CSV
              </Link>
            </div>
          </div>
        ) : (
          <div className="operational-filter-actions">
            <div className="operational-filter-actions__left">{activeFilterChips}</div>
            <div className="operational-filter-actions__right">
              <button
                type="submit"
                className="operational-filter-btn operational-filter-btn--apply"
                disabled={isPending}
                aria-busy={isPending || undefined}
                onMouseDown={(event) => event.preventDefault()}
              >
                {isPending ? "Applying…" : "Apply filters"}
              </button>
              <button
                type="button"
                className="operational-filter-btn operational-filter-btn--clear"
                onClick={onClear}
                disabled={isPending}
                onMouseDown={(event) => event.preventDefault()}
              >
                Clear filters
              </button>
              <Link
                href={exportHref}
                prefetch={false}
                className="operational-filter-btn operational-filter-btn--export"
              >
                Export CSV
              </Link>
            </div>
          </div>
        )}

        {advancedFilters ? (
          <div
            id={advancedFiltersId}
            className={cn(
              "operational-filter-advanced",
              moreFiltersOpen && "operational-filter-advanced--open",
            )}
            inert={moreFiltersOpen ? undefined : true}
          >
            <div className="operational-filter-advanced__inner">
              <OperationalFilterGrid>{advancedFilters}</OperationalFilterGrid>
            </div>
          </div>
        ) : null}

        {showResultCount ? (
          <p
            className="operational-filter-result-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {resultCount === 0 ? (
              <>No {resultNounPlural} match</>
            ) : (
              <>
                <span className="operational-filter-result-count__value">
                  {formatCount(resultCount)}
                </span>{" "}
                {resultLabel} {matchLabel}
              </>
            )}
          </p>
        ) : null}
      </form>
    </div>
  );
}

type OperationalTableHeaderProps = {
  title: string;
  titleId?: string;
  description?: ReactNode;
};

export function OperationalTableHeader({
  title,
  titleId,
  description,
}: OperationalTableHeaderProps) {
  return (
    <div className="operational-filter-panel">
      <h2 id={titleId} className="operational-filter-panel__title">
        {title}
      </h2>
      {description ? (
        <div className="operational-filter-panel__description">{description}</div>
      ) : null}
    </div>
  );
}
