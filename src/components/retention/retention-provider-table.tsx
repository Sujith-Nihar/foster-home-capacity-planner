import Link from "next/link";

import { DataTableShell } from "@/components/data-table-shell";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import { RetentionFilters, RetentionSortHeader } from "@/components/retention/retention-filters";
import { RetentionPagination } from "@/components/retention/retention-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FilterOptionsDto, PaginatedResult, ProviderMetricsDto } from "@/lib/types/domain";
import {
  formatAgePreferenceRange,
  formatBooleanLabel,
  formatCount,
  formatNullablePercent,
  formatOutreachPriorityLabel,
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

export function RetentionProviderTable({
  providers,
  pagination,
  filterOptions,
  searchParams,
  exportQuery,
}: RetentionProviderTableProps) {
  const startIndex = pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.totalCount);

  return (
    <DataTableShell
      title="Licensed provider outreach list"
      titleId="retention-provider-table-heading"
      description="Review licensed providers by outreach priority, placement activity, license timing, and engagement."
      filters={
        <RetentionFilters
          filterOptions={filterOptions}
          searchParams={searchParams}
          exportQuery={exportQuery}
        />
      }
      footer={
        pagination.totalCount > 0 ? (
          <>
            <p className="border-b border-border-default px-4 py-3 text-sm text-text-secondary">
              Showing {formatCount(startIndex)}–{formatCount(endIndex)} of{" "}
              {formatCount(pagination.totalCount)} providers matching the current filters.
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
        <Table>
          <TableHeader className="sticky top-0 bg-surface-raised">
            <TableRow>
              <TableHead scope="col">
                <RetentionSortHeader label="Provider ID" sortKey="provider_id" searchParams={searchParams} />
              </TableHead>
              <TableHead scope="col">
                <RetentionSortHeader label="County" sortKey="county" searchParams={searchParams} />
              </TableHead>
              <TableHead scope="col">License expiration</TableHead>
              <TableHead scope="col" className="text-right">
                <RetentionSortHeader
                  label="Days until expiration"
                  sortKey="days_until_expiration"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col">
                <RetentionSortHeader
                  label="Current activity"
                  sortKey="currently_has_placement"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className="text-right">
                <RetentionSortHeader
                  label="Days since last placement"
                  sortKey="days_since_last_placement"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className="text-right">Active days (365)</TableHead>
              <TableHead scope="col" className="text-right">
                <RetentionSortHeader
                  label="Engagement rate"
                  sortKey="engagement_rate_last_365"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col">
                <RetentionSortHeader
                  label="Outreach priority"
                  sortKey="outreach_priority"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col">Reasons</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.providerId}>
                <TableCell>
                  <Link
                    href={`/providers/${provider.providerId}`}
                    className="font-medium text-accent-brand underline-offset-4 hover:underline"
                  >
                    {formatProviderId(provider.providerId)}
                  </Link>
                </TableCell>
                <TableCell>{provider.county}</TableCell>
                <TableCell>{formatReportingDate(provider.licenseEndDate)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(provider.daysUntilExpiration)}
                </TableCell>
                <TableCell>
                  {formatBooleanLabel(
                    provider.currentlyHasPlacement,
                    "Active",
                    "Inactive",
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {provider.daysSinceLastPlacement === null
                    ? "—"
                    : formatCount(provider.daysSinceLastPlacement)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(provider.activeDaysLast365)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNullablePercent(provider.engagementRateLast365)}
                </TableCell>
                <TableCell>
                  <PriorityBadge
                    level={priorityToAttentionLevel(provider.outreachPriority)}
                    label={formatOutreachPriorityLabel(provider.outreachPriority)}
                  />
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal text-text-secondary">
                  <div className="space-y-1">
                    {provider.outreachReasons.length > 0 ? (
                      <p>{provider.outreachReasons.join("; ")}</p>
                    ) : (
                      <p>—</p>
                    )}
                    <p className="text-xs text-text-tertiary">
                      {formatAgePreferenceRange(provider.minAge, provider.maxAge)}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataTableShell>
  );
}
