import Link from "next/link";

import { OperationalDataTable } from "@/components/ui/operational-data-table";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import { RetentionFilterToolbar } from "@/components/retention/retention-filter-toolbar";
import { RetentionSortHeader } from "@/components/retention/retention-filters";
import { RetentionPagination } from "@/components/retention/retention-pagination";
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
import {
  TableMobileDetails,
  TableMobileField,
  TableMobileItem,
  TableMobileList,
} from "@/components/ui/table-mobile-list";
import { tableColumnClasses, TruncateCell } from "@/components/ui/table-utils";
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

function RetentionMobileList({ providers }: { providers: ProviderMetricsDto[] }) {
  return (
    <TableMobileList>
      {providers.map((provider) => {
        const reasons =
          provider.outreachReasons.length > 0 ? provider.outreachReasons.join("; ") : "—";

        return (
          <TableMobileItem key={provider.providerId}>
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/providers/${provider.providerId}`}
                className="font-medium text-brand-navy underline-offset-4 hover:underline"
              >
                Provider {formatProviderId(provider.providerId)}
              </Link>
              <PriorityBadge
                level={priorityToAttentionLevel(provider.outreachPriority)}
                label={formatOutreachPriorityLabel(provider.outreachPriority)}
              />
            </div>
            <dl className="mt-3 space-y-2">
              <TableMobileField
                label="Days until expiration"
                value={formatCount(provider.daysUntilExpiration)}
              />
              <TableMobileField
                label="Current activity"
                value={formatBooleanLabel(
                  provider.currentlyHasPlacement,
                  "Active",
                  "Inactive",
                )}
              />
            </dl>
            <TableMobileDetails summary="View additional provider metrics">
              <TableMobileField label="County" value={provider.county} />
              <TableMobileField
                label="License expiration"
                value={formatReportingDate(provider.licenseEndDate)}
              />
              <TableMobileField
                label="Days since last placement"
                value={
                  provider.daysSinceLastPlacement === null
                    ? "—"
                    : formatCount(provider.daysSinceLastPlacement)
                }
              />
              <TableMobileField
                label="Engagement rate"
                value={formatNullablePercent(provider.engagementRateLast365)}
              />
              <TableMobileField label="Reasons" value={reasons} />
              <TableMobileField
                label="Age preference"
                value={formatAgePreferenceRange(provider.minAge, provider.maxAge)}
              />
            </TableMobileDetails>
          </TableMobileItem>
        );
      })}
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
      description="Review licensed providers by outreach priority, placement activity, license timing, and engagement."
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

          <div className="table-desktop-only data-table-viewport--scroll">
            <Table>
              <TableColgroup>
                <TableCol style={{ width: "9%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "8%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "9%" }} />
                <TableCol style={{ width: "9%" }} />
                <TableCol style={{ width: "8%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "9%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "8%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "8%" }} />
                <TableCol style={{ width: "10%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "22%" }} />
              </TableColgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col">
                    <RetentionSortHeader
                      label="Provider ID"
                      sortKey="provider_id"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.tabletHidden}>
                    <RetentionSortHeader label="County" sortKey="county" searchParams={searchParams} />
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.tabletHidden}>
                    License expiration
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.numeric}>
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
                  <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                    <RetentionSortHeader
                      label="Days since last placement"
                      sortKey="days_since_last_placement"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                    Active days (365)
                  </TableHead>
                  <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
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
                  <TableHead scope="col" className={tableColumnClasses.tabletHidden}>
                    Reasons
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => {
                  const reasons =
                    provider.outreachReasons.length > 0
                      ? provider.outreachReasons.join("; ")
                      : "—";

                  return (
                    <TableRow key={provider.providerId}>
                      <TableCell>
                        <Link
                          href={`/providers/${provider.providerId}`}
                          className="font-medium text-brand-navy underline-offset-4 hover:underline"
                        >
                          {formatProviderId(provider.providerId)}
                        </Link>
                      </TableCell>
                      <TableCell className={tableColumnClasses.tabletHidden}>
                        <TruncateCell lines={1}>{provider.county}</TruncateCell>
                      </TableCell>
                      <TableCell className={tableColumnClasses.tabletHidden}>
                        {formatReportingDate(provider.licenseEndDate)}
                      </TableCell>
                      <TableCell className={tableColumnClasses.numeric}>
                        {formatCount(provider.daysUntilExpiration)}
                      </TableCell>
                      <TableCell>
                        {formatBooleanLabel(
                          provider.currentlyHasPlacement,
                          "Active",
                          "Inactive",
                        )}
                      </TableCell>
                      <TableCell className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                        {provider.daysSinceLastPlacement === null
                          ? "—"
                          : formatCount(provider.daysSinceLastPlacement)}
                      </TableCell>
                      <TableCell className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                        {formatCount(provider.activeDaysLast365)}
                      </TableCell>
                      <TableCell className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                        {formatNullablePercent(provider.engagementRateLast365)}
                      </TableCell>
                      <TableCell>
                        <PriorityBadge
                          level={priorityToAttentionLevel(provider.outreachPriority)}
                          label={formatOutreachPriorityLabel(provider.outreachPriority)}
                        />
                      </TableCell>
                      <TableCell className={tableColumnClasses.tabletHidden}>
                        <TruncateCell title={reasons}>{reasons}</TruncateCell>
                        <p className="mt-1 text-xs text-text-secondary">
                          {formatAgePreferenceRange(provider.minAge, provider.maxAge)}
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </OperationalDataTable>
  );
}
