import Link from "next/link";

import { OperationalDataTable } from "@/components/ui/operational-data-table";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import { RetentionFilterToolbar } from "@/components/retention/retention-filter-toolbar";
import { RetentionSortHeader } from "@/components/retention/retention-filters";
import { RetentionPagination } from "@/components/retention/retention-pagination";
import {
  formatLicenseTiming,
  formatProviderStatus,
  formatRecentEngagement,
  PrimaryReason,
} from "@/components/shared/reason-summary";
import { TableViewActionLink } from "@/components/shared/table-view-action-link";
import {
  Table,
  TableBody,
  TableCell,
  TableCol,
  TableColgroup,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableMobileField, TableMobileItem, TableMobileList } from "@/components/ui/table-mobile-list";
import { tableColumnClasses, TruncateCell } from "@/components/ui/table-utils";
import type { FilterOptionsDto, PaginatedResult, ProviderMetricsDto } from "@/lib/types/domain";
import {
  formatCompactOutreachPriorityLabel,
  formatCount,
  formatProviderId,
  formatReportingDate,
} from "@/lib/utils/formatters";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

type RetentionProviderTableProps = {
  providers: ProviderMetricsDto[];
  pagination: PaginatedResult<ProviderMetricsDto>;
  filterOptions: FilterOptionsDto;
  searchParams: RetentionSearchParams;
  exportQuery: string;
};

const ROW_CELL = "py-2.5 align-middle";

function RetentionMobileList({ providers }: { providers: ProviderMetricsDto[] }) {
  return (
    <TableMobileList>
      {providers.map((provider) => (
        <TableMobileItem key={provider.providerId}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/providers/${provider.providerId}`}
                className="font-medium text-brand-navy underline-offset-4 hover:underline"
              >
                Provider {formatProviderId(provider.providerId)}
              </Link>
              <p className="mt-0.5 text-sm text-text-secondary">{provider.county}</p>
            </div>
            <PriorityBadge
              level={priorityToAttentionLevel(provider.outreachPriority)}
              label={formatCompactOutreachPriorityLabel(provider.outreachPriority)}
              className="shrink-0 whitespace-nowrap"
            />
          </div>
          <dl className="mt-3 space-y-2">
            <TableMobileField
              label="Current status"
              value={formatProviderStatus(provider.currentlyHasPlacement)}
            />
            <TableMobileField
              label="License timing"
              value={formatLicenseTiming(
                provider.licenseEndDate,
                provider.daysUntilExpiration,
                formatReportingDate,
              )}
            />
            <TableMobileField
              label="Recent engagement"
              value={formatRecentEngagement(
                provider.activeDaysLast365,
                provider.engagementRateLast365,
              )}
            />
            <TableMobileField
              label="Why review"
              value={
                <PrimaryReason
                  reasons={provider.outreachReasons}
                  moreOnPageLabel="provider page"
                />
              }
            />
          </dl>
          <div className="mt-3 border-t border-border-subtle pt-3">
            <TableViewActionLink
              href={`/providers/${provider.providerId}`}
              label="View provider"
            />
          </div>
        </TableMobileItem>
      ))}
    </TableMobileList>
  );
}

export function RetentionProviderTable({
  providers,
  pagination,
  filterOptions,
  searchParams,
  exportQuery,
}: RetentionProviderTableProps) {
  const startIndex =
    pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.totalCount);

  return (
    <OperationalDataTable
      title="Licensed provider outreach list"
      titleId="retention-provider-table-heading"
      description="Review licensed providers by suggested outreach priority, placement activity, license timing, and engagement."
      toolbar={
        <RetentionFilterToolbar
          filterOptions={filterOptions}
          searchParams={searchParams}
          exportQuery={exportQuery}
          totalCount={pagination.totalCount}
        />
      }
      footer={
        pagination.totalCount > 0 ? (
          <>
            <p className="border-b border-border-subtle px-1 py-2 text-sm text-text-secondary">
              Showing {formatCount(startIndex)}–{formatCount(endIndex)} of{" "}
              {formatCount(pagination.totalCount)} providers
            </p>
            <RetentionPagination
              searchParams={searchParams}
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
            />
          </>
        ) : (
          "No providers match the current filters."
        )
      }
    >
      {providers.length === 0 ? (
        <p className="px-4 py-6 text-sm text-text-secondary" role="status">
          No licensed providers match the current filters.
        </p>
      ) : (
        <>
          <RetentionMobileList providers={providers} />

          <div className="table-desktop-only min-w-0 data-table-viewport--scroll">
            <Table className="min-w-0">
              <TableColgroup>
                <TableCol style={{ width: "10%" }} />
                <TableCol className={tableColumnClasses.narrowHidden} style={{ width: "9%" }} />
                <TableCol style={{ width: "11%" }} />
                <TableCol style={{ width: "15%" }} />
                <TableCol style={{ width: "16%" }} />
                <TableCol style={{ width: "13%" }} />
                <TableCol style={{ width: "18%" }} />
                <TableCol style={{ width: "10%" }} />
              </TableColgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className={ROW_CELL}>
                    <RetentionSortHeader
                      label="Provider"
                      sortKey="provider_id"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={`${ROW_CELL} ${tableColumnClasses.narrowHidden}`}>
                    <RetentionSortHeader label="County" sortKey="county" searchParams={searchParams} />
                  </TableHead>
                  <TableHead scope="col" className={ROW_CELL}>
                    <RetentionSortHeader
                      label="Current status"
                      sortKey="currently_has_placement"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={ROW_CELL}>
                    License timing
                  </TableHead>
                  <TableHead scope="col" className={ROW_CELL}>
                    Recent engagement
                  </TableHead>
                  <TableHead scope="col" className={`${ROW_CELL} min-w-0`}>
                    <RetentionSortHeader
                      label="Suggested outreach priority"
                      sortKey="outreach_priority"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={ROW_CELL}>
                    Why review
                  </TableHead>
                  <TableHead scope="col" className={ROW_CELL}>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.providerId}>
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      <Link
                        href={`/providers/${provider.providerId}`}
                        className="font-medium text-brand-navy underline-offset-4 hover:underline"
                      >
                        {formatProviderId(provider.providerId)}
                      </Link>
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0 ${tableColumnClasses.narrowHidden}`}>
                      <TruncateCell lines={1}>{provider.county}</TruncateCell>
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0 whitespace-nowrap`}>
                      {formatProviderStatus(provider.currentlyHasPlacement)}
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      {formatLicenseTiming(
                        provider.licenseEndDate,
                        provider.daysUntilExpiration,
                        formatReportingDate,
                      )}
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      {formatRecentEngagement(
                        provider.activeDaysLast365,
                        provider.engagementRateLast365,
                        { hideSecondaryOnNarrow: true },
                      )}
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      <div className="w-fit max-w-full">
                        <PriorityBadge
                          level={priorityToAttentionLevel(provider.outreachPriority)}
                          label={formatCompactOutreachPriorityLabel(provider.outreachPriority)}
                          className="whitespace-nowrap"
                        />
                      </div>
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      <PrimaryReason
                        reasons={provider.outreachReasons}
                        moreOnPageLabel="provider page"
                        hideMoreOnNarrow
                      />
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      <TableViewActionLink
                        href={`/providers/${provider.providerId}`}
                        label="View provider"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </OperationalDataTable>
  );
}
