import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { RetentionSearchParams } from "@/lib/validation/search-params";
import { buildRetentionPageHref } from "@/lib/retention/query";
import { formatCount } from "@/lib/utils/formatters";

type RetentionPaginationProps = {
  searchParams: RetentionSearchParams;
  page: number;
  totalPages: number;
  totalCount: number;
};

export function RetentionPagination({
  searchParams,
  page,
  totalPages,
  totalCount,
}: RetentionPaginationProps) {
  if (totalCount === 0) {
    return null;
  }

  const previousHref = page > 1 ? buildRetentionPageHref(searchParams, page - 1) : null;
  const nextHref = page < totalPages ? buildRetentionPageHref(searchParams, page + 1) : null;

  return (
    <nav
      aria-label="Provider table pagination"
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
            nativeButton={false}
            render={<Link href={previousHref} prefetch={false} />}
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
            nativeButton={false}
            render={<Link href={nextHref} prefetch={false} />}
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
