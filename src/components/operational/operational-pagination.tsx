"use client";

import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOperationalFilters } from "@/hooks/use-operational-filters";
import { scrollToResultsHeading } from "@/lib/filters/scroll-to-results";
import { buildPageNumberTokens } from "@/lib/pagination/page-numbers";
import {
  computePageRange,
  formatLiveRangeAnnouncement,
  formatResultRangeLabel,
} from "@/lib/pagination/range";
import { cn } from "@/lib/utils";

type OperationalPaginationProps = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  noun: string;
  nounPlural: string;
  resultsHeadingId: string;
  pageSizeOptions: readonly number[];
  defaultPageSize: number;
  buildPageHref: (page: number) => string;
  buildPageSizeHref: (pageSize: number) => string;
  ariaLabel?: string;
};

export function OperationalPagination({
  page,
  pageSize,
  totalPages,
  totalCount,
  noun,
  nounPlural,
  resultsHeadingId,
  pageSizeOptions,
  defaultPageSize,
  buildPageHref,
  buildPageSizeHref,
  ariaLabel = "Table pagination",
}: OperationalPaginationProps) {
  const { navigate, isPending } = useOperationalFilters();
  const liveRegionId = useId();
  const previousPageRef = useRef(page);
  const { startIndex, endIndex } = computePageRange(page, pageSize, totalCount);
  const pageTokens = buildPageNumberTokens(page, totalPages);
  const showNumberedPages = totalPages > 1;

  useEffect(() => {
    if (previousPageRef.current === page) {
      return;
    }

    previousPageRef.current = page;
    scrollToResultsHeading(resultsHeadingId);

    const heading = document.getElementById(resultsHeadingId);
    if (heading) {
      if (!heading.hasAttribute("tabindex")) {
        heading.setAttribute("tabindex", "-1");
      }
      heading.focus({ preventScroll: true });
    }
  }, [page, resultsHeadingId]);

  if (totalCount === 0) {
    return null;
  }

  function goToHref(href: string) {
    const path = href.replace(/^\/(recruitment|retention)/, "");
    navigate(path);
  }

  const previousHref = page > 1 ? buildPageHref(page - 1) : null;
  const nextHref = page < totalPages ? buildPageHref(page + 1) : null;

  return (
    <nav
      aria-label={ariaLabel}
      aria-busy={isPending || undefined}
      className="border-t border-border-default px-4 py-3"
    >
      <p id={liveRegionId} className="sr-only" aria-live="polite" aria-atomic="true">
        {formatLiveRangeAnnouncement(startIndex, endIndex, totalCount, nounPlural)}
      </p>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-text-secondary">
          {formatResultRangeLabel(startIndex, endIndex, totalCount, noun, nounPlural)}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {previousHref ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 min-w-[5.5rem] px-4"
                disabled={isPending}
                onClick={() => goToHref(previousHref)}
              >
                Previous
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 min-w-[5.5rem] px-4"
                disabled
              >
                Previous
              </Button>
            )}

            <p className="min-h-11 px-2 text-sm text-text-secondary sm:hidden" aria-current="page">
              Page {page} of {Math.max(totalPages, 1)}
            </p>

            {showNumberedPages ? (
              <ol className="hidden items-center gap-1 sm:flex">
                {pageTokens.map((token, index) =>
                  token === "ellipsis" ? (
                    <li
                      key={`ellipsis-${index}`}
                      className="px-2 text-sm text-text-tertiary"
                      aria-hidden="true"
                    >
                      …
                    </li>
                  ) : (
                    <li key={token}>
                      <Button
                        type="button"
                        variant={token === page ? "default" : "outline"}
                        className={cn(
                          "min-h-11 min-w-11 px-3",
                          token === page && "pointer-events-none",
                        )}
                        aria-label={`Go to page ${token}`}
                        aria-current={token === page ? "page" : undefined}
                        disabled={isPending || token === page}
                        onClick={() => goToHref(buildPageHref(token))}
                      >
                        {token}
                      </Button>
                    </li>
                  ),
                )}
              </ol>
            ) : null}

            {nextHref ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 min-w-[5.5rem] px-4"
                disabled={isPending}
                onClick={() => goToHref(nextHref)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 min-w-[5.5rem] px-4"
                disabled
              >
                Next
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor={`${liveRegionId}-page-size`} className="text-sm text-text-secondary">
              Rows per page
            </label>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                const nextSize = Number(value);
                if (nextSize !== pageSize) {
                  goToHref(buildPageSizeHref(nextSize));
                }
              }}
            >
              <SelectTrigger
                id={`${liveRegionId}-page-size`}
                className="min-h-11 w-[5.5rem]"
                disabled={isPending}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </nav>
  );
}
