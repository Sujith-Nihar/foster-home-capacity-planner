import Link from "next/link";

import { DataTableShell } from "@/components/data-table-shell";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
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
import { tableColumnClasses } from "@/components/ui/table-utils";
import type { PaginatedResult, ProviderMetricsDto } from "@/lib/types/domain";
import {
  formatBooleanLabel,
  formatCount,
  formatNullablePercent,
  formatOutreachPriorityLabel,
  formatProviderId,
} from "@/lib/utils/formatters";

type CountyRetentionTableProps = {
  county: string;
  providers: ProviderMetricsDto[];
  pagination: PaginatedResult<ProviderMetricsDto>;
};

export function CountyRetentionTable({
  county,
  providers,
  pagination,
}: CountyRetentionTableProps) {
  const retentionHref = `/retention?county=${encodeURIComponent(county)}`;

  return (
    <section aria-labelledby="county-retention-heading">
      <DataTableShell
        titleId="county-retention-heading"
        title="Retention outreach providers"
        description="Licensed providers in this county that may warrant staff review based on outreach priority."
        actions={
          <Link
            href={retentionHref}
            className="text-sm font-medium text-brand-navy underline-offset-4 hover:underline"
          >
            View all county providers
          </Link>
        }
        footer={`Showing ${formatCount(providers.length)} of ${formatCount(pagination.totalCount)} providers in ${county} County.`}
      >
        {providers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-text-secondary" role="status">
            No licensed providers match the current filters for this county.
          </p>
        ) : (
          <>
            <TableMobileList>
              {providers.map((provider) => (
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
                      label="Placement status"
                      value={formatBooleanLabel(
                        provider.currentlyHasPlacement,
                        "Active",
                        "Inactive",
                      )}
                    />
                  </dl>
                  <TableMobileDetails summary="View engagement details">
                    <TableMobileField
                      label="Engagement (365 days)"
                      value={formatNullablePercent(provider.engagementRateLast365)}
                    />
                  </TableMobileDetails>
                </TableMobileItem>
              ))}
            </TableMobileList>

            <div className="table-desktop-only">
              <Table>
                <TableColgroup>
                  <TableCol style={{ width: "24%" }} />
                  <TableCol style={{ width: "22%" }} />
                  <TableCol style={{ width: "18%" }} />
                  <TableCol style={{ width: "18%" }} />
                  <TableCol style={{ width: "18%" }} />
                </TableColgroup>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead scope="col">Provider</TableHead>
                    <TableHead scope="col">Outreach priority</TableHead>
                    <TableHead scope="col" className={tableColumnClasses.numeric}>
                      Days until expiration
                    </TableHead>
                    <TableHead scope="col">Placement status</TableHead>
                    <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                      Engagement (365 days)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.providerId}>
                      <TableCell>
                        <Link
                          href={`/providers/${provider.providerId}`}
                          className="font-medium text-brand-navy underline-offset-4 hover:underline"
                        >
                          Provider {formatProviderId(provider.providerId)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge
                          level={priorityToAttentionLevel(provider.outreachPriority)}
                          label={formatOutreachPriorityLabel(provider.outreachPriority)}
                        />
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
                        {formatNullablePercent(provider.engagementRateLast365)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DataTableShell>
    </section>
  );
}
