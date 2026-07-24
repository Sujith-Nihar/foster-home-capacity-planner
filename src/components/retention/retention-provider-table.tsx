import Link from "next/link";

import { OperationalDataTable } from "@/components/ui/operational-data-table";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import { RetentionFilterToolbar } from "@/components/retention/retention-filter-toolbar";
import { RetentionSortHeader } from "@/components/retention/retention-filters";
import { RetentionPagination } from "@/components/retention/retention-pagination";
import { StackedTableCell } from "@/components/shared/stacked-table-cell";
import {
  formatLicenseTiming,
  formatRecentEngagement,
  PrimaryReason,
  RetentionStatusCell,
  StatusAndRenewalCell,
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
import type { FilterOptionsDto, PaginatedResult, ProviderMetricsDto } from "@/lib/types/domain";
import {
  formatCompactOutreachPriorityLabel,
  formatCount,
  formatCountyName,
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

const ROW_CELL = "retention-provider-table__row-cell align-middle";

function providerReasonContext(provider: ProviderMetricsDto) {
  return {
    daysSinceLastPlacement: provider.daysSinceLastPlacement,
    daysUntilExpiration: provider.daysUntilExpiration,
    currentlyHasPlacement: provider.currentlyHasPlacement,
    engagementRateLast365: provider.engagementRateLast365,
  };
}

function RetentionMobileList({ providers }: { providers: ProviderMetricsDto[] }) {
  return (
    <TableMobileList>
      {providers.map((provider) => (
        <TableMobileItem key={provider.providerId}>
          <div className="min-w-0">
            <Link
              href={`/providers/${provider.providerId}`}
              className="font-medium text-brand-navy underline-offset-4 hover:underline"
            >
              {formatProviderId(provider.providerId)}
            </Link>
            <p className="mt-0.5 text-sm text-text-secondary">{formatCountyName(provider.county)}</p>
          </div>
          <dl className="mt-3 space-y-2">
            <TableMobileField
              label="Current status"
              value={
                <RetentionStatusCell
                  currentlyHasPlacement={provider.currentlyHasPlacement}
                  daysSinceLastPlacement={provider.daysSinceLastPlacement}
                />
              }
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
              label="Suggested outreach"
              value={
                <PriorityBadge
                  level={priorityToAttentionLevel(provider.outreachPriority)}
                  label={formatCompactOutreachPriorityLabel(provider.outreachPriority)}
                  className="w-fit whitespace-nowrap"
                />
              }
            />
            <TableMobileField
              label="Why review"
              value={
                <PrimaryReason
                  reasons={provider.outreachReasons}
                  context={providerReasonContext(provider)}
                  providerId={provider.providerId}
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
      className="retention-data-table"
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

          <div className="table-desktop-only min-w-0">
            <Table className="retention-provider-table w-full min-w-0 table-fixed">
              <TableColgroup>
                <TableCol className="retention-col retention-col--provider" />
                <TableCol className="retention-col retention-col--status retention-col--split" />
                <TableCol className="retention-col retention-col--license retention-col--split" />
                <TableCol className="retention-col retention-col--combined" />
                <TableCol className="retention-col retention-col--engagement" />
                <TableCol className="retention-col retention-col--outreach" />
                <TableCol className="retention-col retention-col--why" />
                <TableCol className="retention-col retention-col--action" />
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
                  <TableHead scope="col" className={`${ROW_CELL} retention-col--split-cell`}>
                    <RetentionSortHeader
                      label="Current status"
                      sortKey="currently_has_placement"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={`${ROW_CELL} retention-col--split-cell`}>
                    License timing
                  </TableHead>
                  <TableHead scope="col" className={`${ROW_CELL} retention-col--combined-cell`}>
                    Status and license
                  </TableHead>
                  <TableHead scope="col" className={ROW_CELL}>
                    Recent engagement
                  </TableHead>
                  <TableHead scope="col" className={`${ROW_CELL} min-w-0`}>
                    <RetentionSortHeader
                      label="Suggested outreach"
                      sortKey="outreach_priority"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={ROW_CELL}>
                    Why review
                  </TableHead>
                  <TableHead scope="col" className={`${ROW_CELL} retention-provider-table__action-cell`}>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.providerId} className="retention-provider-table__row">
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      <StackedTableCell
                        primary={
                          <Link
                            href={`/providers/${provider.providerId}`}
                            className="font-medium text-brand-navy underline-offset-4 hover:underline"
                          >
                            {formatProviderId(provider.providerId)}
                          </Link>
                        }
                        secondary={formatCountyName(provider.county)}
                      />
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0 retention-col--split-cell`}>
                      <RetentionStatusCell
                        currentlyHasPlacement={provider.currentlyHasPlacement}
                        daysSinceLastPlacement={provider.daysSinceLastPlacement}
                      />
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0 retention-col--split-cell`}>
                      {formatLicenseTiming(
                        provider.licenseEndDate,
                        provider.daysUntilExpiration,
                        formatReportingDate,
                      )}
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0 retention-col--combined-cell`}>
                      <StatusAndRenewalCell
                        currentlyHasPlacement={provider.currentlyHasPlacement}
                        daysSinceLastPlacement={provider.daysSinceLastPlacement}
                        licenseEndDate={provider.licenseEndDate}
                        daysUntilExpiration={provider.daysUntilExpiration}
                        formatDate={formatReportingDate}
                      />
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      {formatRecentEngagement(
                        provider.activeDaysLast365,
                        provider.engagementRateLast365,
                      )}
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      <PriorityBadge
                        level={priorityToAttentionLevel(provider.outreachPriority)}
                        label={formatCompactOutreachPriorityLabel(provider.outreachPriority)}
                        className="w-fit max-w-full whitespace-nowrap"
                      />
                    </TableCell>
                    <TableCell className={`${ROW_CELL} min-w-0`}>
                      <PrimaryReason
                        reasons={provider.outreachReasons}
                        context={providerReasonContext(provider)}
                        providerId={provider.providerId}
                        className="retention-provider-table__reason"
                      />
                    </TableCell>
                    <TableCell className={`${ROW_CELL} retention-provider-table__action-cell min-w-0`}>
                      <TableViewActionLink
                        href={`/providers/${provider.providerId}`}
                        label="View provider"
                        compact
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
