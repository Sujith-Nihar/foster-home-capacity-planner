import Link from "next/link";

import { DataTableShell } from "@/components/data-table-shell";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
            className="text-sm font-medium text-accent-brand underline-offset-4 hover:underline"
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Provider</TableHead>
                <TableHead scope="col">Outreach priority</TableHead>
                <TableHead scope="col" className="text-right">
                  Days until expiration
                </TableHead>
                <TableHead scope="col">Placement status</TableHead>
                <TableHead scope="col" className="text-right">
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
                      className="font-medium text-accent-brand underline-offset-4 hover:underline"
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
                  <TableCell className="text-right tabular-nums">
                    {formatCount(provider.daysUntilExpiration)}
                  </TableCell>
                  <TableCell>
                    {formatBooleanLabel(
                      provider.currentlyHasPlacement,
                      "Currently has placement",
                      "No current placement",
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNullablePercent(provider.engagementRateLast365)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTableShell>
    </section>
  );
}
