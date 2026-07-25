"use client";

import { OperationalPagination } from "@/components/operational/operational-pagination";
import {
  RETENTION_DEFAULT_PAGE_SIZE,
  RETENTION_PAGE_SIZE_OPTIONS,
} from "@/lib/pagination/constants";
import {
  buildRetentionPageHref,
  buildRetentionPageSizeHref,
} from "@/lib/retention/query";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

type RetentionPaginationProps = {
  searchParams: RetentionSearchParams;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  resultsHeadingId?: string;
};

export function RetentionPagination({
  searchParams,
  page,
  pageSize,
  totalPages,
  totalCount,
  resultsHeadingId = "retention-provider-table-heading",
}: RetentionPaginationProps) {
  return (
    <OperationalPagination
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      totalCount={totalCount}
      noun="provider"
      nounPlural="providers"
      resultsHeadingId={resultsHeadingId}
      pageSizeOptions={RETENTION_PAGE_SIZE_OPTIONS}
      defaultPageSize={RETENTION_DEFAULT_PAGE_SIZE}
      buildPageHref={(nextPage) => buildRetentionPageHref(searchParams, nextPage)}
      buildPageSizeHref={(nextPageSize) => buildRetentionPageSizeHref(searchParams, nextPageSize)}
      ariaLabel="Provider table pagination"
    />
  );
}
