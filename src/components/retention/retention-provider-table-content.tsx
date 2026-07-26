import Link from "next/link";
import type { ReactNode } from "react";

import {
  OutreachPriorityColumnHelp,
  PlacementActivityColumnHelp,
} from "@/components/retention/retention-column-help";
import { OutreachPriorityBadge } from "@/components/retention/outreach-priority-badge";
import { RetentionSortHeader } from "@/components/retention/retention-filters";
import { StackedTableCell } from "@/components/shared/stacked-table-cell";
import {
  formatLicenseTiming,
  formatPlacementActivity,
  getPrimaryOutreachReasonForDisplay,
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
import type { ProviderMetricsDto } from "@/lib/types/domain";
import { formatCountyName, formatProviderId, formatReportingDate } from "@/lib/utils/formatters";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

const HEADER_CELL = "operational-table-head-cell retention-provider-table__row-cell align-middle";
const ROW_CELL = "operational-table-row-cell retention-provider-table__row-cell align-middle";

type RetentionProviderTableContentProps = {
  providers: ProviderMetricsDto[];
  searchParams: RetentionSearchParams;
};

function providerReasonContext(provider: ProviderMetricsDto) {
  return {
    daysSinceLastPlacement: provider.daysSinceLastPlacement,
    daysUntilExpiration: provider.daysUntilExpiration,
    currentlyHasPlacement: provider.currentlyHasPlacement,
    engagementRateLast365: provider.engagementRateLast365,
    eligibleLicensedDaysLast365: provider.eligibleLicensedDaysLast365,
    activeDaysLast365: provider.activeDaysLast365,
  };
}

function ColumnHeaderLabel({
  label,
  help,
}: {
  label: ReactNode;
  help?: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      {help}
    </span>
  );
}

function RetentionMobileList({ providers }: { providers: ProviderMetricsDto[] }) {
  return (
    <TableMobileList>
      {providers.map((provider) => {
        const reasonContext = providerReasonContext(provider);
        const primaryReason = getPrimaryOutreachReasonForDisplay(
          provider.outreachReasons,
          reasonContext,
        );

        return (
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
                label="Suggested outreach priority"
                value={
                  <OutreachPriorityBadge
                    priority={provider.outreachPriority}
                    primaryReason={primaryReason}
                  />
                }
              />
              <TableMobileField
                label="Why review"
                value={
                  <PrimaryReason
                    reasons={provider.outreachReasons}
                    context={reasonContext}
                  />
                }
              />
              <TableMobileField
                label="Current placement status"
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
                label="Placement activity, past 12 months"
                value={formatPlacementActivity(
                  provider.activeDaysLast365,
                  provider.engagementRateLast365,
                )}
              />
            </dl>
            <div className="mt-3 border-t border-border-subtle pt-3">
              <TableViewActionLink
                href={`/providers/${provider.providerId}`}
                label="View provider"
              />
            </div>
          </TableMobileItem>
        );
      })}
    </TableMobileList>
  );
}

export function RetentionProviderTableContent({
  providers,
  searchParams,
}: RetentionProviderTableContentProps) {
  return (
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
              <TableHead scope="col" className={HEADER_CELL}>
                <RetentionSortHeader
                  label="Provider"
                  sortKey="provider_id"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className={`${HEADER_CELL} retention-col--split-cell`}>
                <RetentionSortHeader
                  label="Current placement status"
                  sortKey="currently_has_placement"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className={`${HEADER_CELL} retention-col--split-cell`}>
                License timing
              </TableHead>
              <TableHead scope="col" className={`${HEADER_CELL} retention-col--combined-cell`}>
                Status and license
              </TableHead>
              <TableHead scope="col" className={HEADER_CELL}>
                <ColumnHeaderLabel
                  label="Placement activity, past 12 months"
                  help={<PlacementActivityColumnHelp />}
                />
              </TableHead>
              <TableHead scope="col" className={`${HEADER_CELL} min-w-0`}>
                <ColumnHeaderLabel
                  label={
                    <RetentionSortHeader
                      label="Suggested outreach priority"
                      sortKey="outreach_priority"
                      searchParams={searchParams}
                    />
                  }
                  help={<OutreachPriorityColumnHelp />}
                />
              </TableHead>
              <TableHead scope="col" className={HEADER_CELL}>
                Why review
              </TableHead>
              <TableHead scope="col" className={`${HEADER_CELL} retention-provider-table__action-cell`}>
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => {
              const reasonContext = providerReasonContext(provider);
              const primaryReason = getPrimaryOutreachReasonForDisplay(
                provider.outreachReasons,
                reasonContext,
              );

              return (
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
                    {formatPlacementActivity(
                      provider.activeDaysLast365,
                      provider.engagementRateLast365,
                    )}
                  </TableCell>
                  <TableCell className={`${ROW_CELL} min-w-0 retention-col--outreach-cell`}>
                    <OutreachPriorityBadge
                      priority={provider.outreachPriority}
                      primaryReason={primaryReason}
                    />
                  </TableCell>
                  <TableCell className={`${ROW_CELL} min-w-0`}>
                    <PrimaryReason
                      reasons={provider.outreachReasons}
                      context={reasonContext}
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
