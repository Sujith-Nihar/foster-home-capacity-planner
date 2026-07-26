import Link from "next/link";

import { DataTableShell } from "@/components/data-table-shell";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import {
  formatLicenseTiming,
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
import {
  TableMobileField,
  TableMobileItem,
  TableMobileList,
} from "@/components/ui/table-mobile-list";
import type { ProviderMetricsDto } from "@/lib/types/domain";
import {
  formatCompactOutreachPriorityLabel,
  formatCountyName,
  formatProviderId,
  formatReportingDate,
} from "@/lib/utils/formatters";

type CountyRetentionTableProps = {
  county: string;
  providers: ProviderMetricsDto[];
};

function providerReasonContext(provider: ProviderMetricsDto) {
  return {
    daysSinceLastPlacement: provider.daysSinceLastPlacement,
    daysUntilExpiration: provider.daysUntilExpiration,
    currentlyHasPlacement: provider.currentlyHasPlacement,
    engagementRateLast365: provider.engagementRateLast365,
  };
}

export function CountyRetentionTable({
  county,
  providers,
}: CountyRetentionTableProps) {
  const countyLabel = formatCountyName(county);
  const retentionHref = `/retention?county=${encodeURIComponent(county)}`;

  return (
    <section aria-labelledby="county-retention-heading">
      <DataTableShell
        titleId="county-retention-heading"
        title="Priority-provider preview"
        description="Licensed providers in this county with the most urgent suggested outreach."
        actions={
          <Link
            href={retentionHref}
            className="text-sm font-medium text-brand-navy underline-offset-4 hover:underline"
          >
            Review all {countyLabel} providers
          </Link>
        }
        footer={`Showing ${providers.length} priority providers in ${countyLabel}.`}
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
                      label={formatCompactOutreachPriorityLabel(provider.outreachPriority)}
                    />
                  </div>
                  <dl className="mt-3 space-y-2">
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
                    <TableMobileField
                      label="License timing"
                      value={formatLicenseTiming(
                        provider.licenseEndDate,
                        provider.daysUntilExpiration,
                        formatReportingDate,
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
              ))}
            </TableMobileList>

            <div className="table-desktop-only">
              <Table>
                <TableColgroup>
                  <TableCol style={{ width: "18%" }} />
                  <TableCol style={{ width: "18%" }} />
                  <TableCol style={{ width: "28%" }} />
                  <TableCol style={{ width: "20%" }} />
                  <TableCol style={{ width: "16%" }} />
                </TableColgroup>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead scope="col">Provider</TableHead>
                    <TableHead scope="col">Suggested outreach</TableHead>
                    <TableHead scope="col">Why review</TableHead>
                    <TableHead scope="col">License timing</TableHead>
                    <TableHead scope="col">Action</TableHead>
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
                          label={formatCompactOutreachPriorityLabel(provider.outreachPriority)}
                        />
                      </TableCell>
                      <TableCell>
                        <PrimaryReason
                          reasons={provider.outreachReasons}
                          context={providerReasonContext(provider)}
                          providerId={provider.providerId}
                        />
                      </TableCell>
                      <TableCell>
                        {formatLicenseTiming(
                          provider.licenseEndDate,
                          provider.daysUntilExpiration,
                          formatReportingDate,
                        )}
                      </TableCell>
                      <TableCell>
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
      </DataTableShell>
    </section>
  );
}
