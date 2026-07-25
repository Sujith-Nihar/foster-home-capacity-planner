"use client";

import { Button } from "@/components/ui/button";
import { useOperationalFilters } from "@/hooks/use-operational-filters";
import { scrollToResultsHeading } from "@/lib/filters/scroll-to-results";
import { buildRetentionPageHref } from "@/lib/retention/query";
import type { RetentionSearchParams } from "@/lib/validation/search-params";
import { formatCount } from "@/lib/utils/formatters";

type RetentionPaginationProps = {
  searchParams: RetentionSearchParams;
  page: number;
  totalPages: number;
  totalCount: number;
  resultsHeadingId?: string;
};

export function RetentionPagination({
  searchParams,
  page,
  totalPages,
  totalCount,
  resultsHeadingId = "retention-provider-table-heading",
}: RetentionPaginationProps) {
  const { navigate, isPending } = useOperationalFilters();

  if (totalCount === 0) {
    return null;
  }

  const previousHref = page > 1 ? buildRetentionPageHref(searchParams, page - 1) : null;
  const nextHref = page < totalPages ? buildRetentionPageHref(searchParams, page + 1) : null;

  function goToPage(href: string) {
    navigate(href.replace(/^\/retention/, ""));
    scrollToResultsHeading(resultsHeadingId);
  }

  return (
    <nav
      aria-label="Provider table pagination"
      aria-busy={isPending || undefined}
      className="flex flex-col gap-3 border-t border-border-default px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-text-secondary">
        Page {formatCount(page)} of {formatCount(Math.max(totalPages, 1))} ·{" "}
        {formatCount(totalCount)} {totalCount === 1 ? "provider" : "providers"} total
      </p>
      <div className="flex items-center gap-2">
        {previousHref ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => goToPage(previousHref)}
          >
            Previous
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        {nextHref ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => goToPage(nextHref)}
          >
            Next
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </nav>
  );
}
