"use client";

import { OperationalPagination } from "@/components/operational/operational-pagination";
import {
  RECRUITMENT_DEFAULT_PAGE_SIZE,
  RECRUITMENT_PAGE_SIZE_OPTIONS,
} from "@/lib/pagination/constants";
import {
  buildRecruitmentPageHref,
  buildRecruitmentPageSizeHref,
} from "@/lib/recruitment/query";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

type RecruitmentPaginationProps = {
  searchParams: RecruitmentSearchParams;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  resultsHeadingId?: string;
};

export function RecruitmentPagination({
  searchParams,
  page,
  pageSize,
  totalPages,
  totalCount,
  resultsHeadingId = "recruitment-county-table-heading",
}: RecruitmentPaginationProps) {
  return (
    <OperationalPagination
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      totalCount={totalCount}
      noun="county"
      nounPlural="counties"
      resultsHeadingId={resultsHeadingId}
      pageSizeOptions={RECRUITMENT_PAGE_SIZE_OPTIONS}
      defaultPageSize={RECRUITMENT_DEFAULT_PAGE_SIZE}
      buildPageHref={(nextPage) => buildRecruitmentPageHref(searchParams, nextPage)}
      buildPageSizeHref={(nextPageSize) => buildRecruitmentPageSizeHref(searchParams, nextPageSize)}
      ariaLabel="County table pagination"
    />
  );
}
