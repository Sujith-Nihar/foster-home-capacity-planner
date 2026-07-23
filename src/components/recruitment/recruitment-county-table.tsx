import type { ReactNode } from "react";
import Link from "next/link";

import { DataTableShell } from "@/components/data-table-shell";
import { RecruitmentSortHeader } from "@/components/recruitment/recruitment-filters";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CountyMetricsDto } from "@/lib/types/domain";
import {
  formatCount,
  formatCountyName,
  formatNullablePercent,
  formatRatio,
  formatRecruitmentPriorityLabel,
} from "@/lib/utils/formatters";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

type RecruitmentCountyTableProps = {
  counties: CountyMetricsDto[];
  searchParams: RecruitmentSearchParams;
  title: string;
  titleId: string;
  description: string;
  emptyMessage: string;
  filters?: ReactNode;
  footer?: ReactNode;
};

export function RecruitmentCountyTable({
  counties,
  searchParams,
  title,
  titleId,
  description,
  emptyMessage,
  filters,
  footer,
}: RecruitmentCountyTableProps) {
  return (
    <DataTableShell
      title={title}
      titleId={titleId}
      description={description}
      filters={filters}
      footer={footer}
    >
      {counties.length === 0 ? (
        <p className="px-4 py-6 text-sm text-text-secondary" role="status">
          {emptyMessage}
        </p>
      ) : (
        <Table>
          <TableHeader className="sticky top-0 bg-surface-raised">
            <TableRow>
              <TableHead scope="col">County</TableHead>
              <TableHead scope="col">
                <RecruitmentSortHeader
                  label="Priority"
                  sortKey="recruitment_priority"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className="text-right">
                <RecruitmentSortHeader
                  label="Foster-home children"
                  sortKey="current_foster_home_children"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className="text-right">
                Active local providers
              </TableHead>
              <TableHead scope="col" className="text-right">
                <RecruitmentSortHeader
                  label="Children per active provider"
                  sortKey="children_per_active_provider"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className="text-right">
                <RecruitmentSortHeader
                  label="Out-of-county rate"
                  sortKey="out_of_county_foster_rate"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col">Highest-pressure age group</TableHead>
              <TableHead scope="col" className="text-right">
                <RecruitmentSortHeader
                  label="Expiring within 90 days"
                  sortKey="expiring_90_days"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col">Readable reasons</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {counties.map((county) => (
              <TableRow key={county.county}>
                <TableCell>
                  <Link
                    href={`/recruitment/${encodeURIComponent(county.county)}`}
                    className="font-medium text-accent-brand underline-offset-4 hover:underline"
                  >
                    {formatCountyName(county.county)}
                  </Link>
                </TableCell>
                <TableCell>
                  <PriorityBadge
                    level={priorityToAttentionLevel(county.recruitmentPriority)}
                    label={formatRecruitmentPriorityLabel(county.recruitmentPriority)}
                  />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(county.currentFosterHomeChildren)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(county.activeProviders)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRatio(county.childrenPerActiveProvider)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNullablePercent(county.outOfCountyFosterRate)}
                </TableCell>
                <TableCell>{county.highestPressureAgeGroup ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(county.expiring90Days)}
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal text-text-secondary">
                  {county.recruitmentReasons.length > 0
                    ? county.recruitmentReasons.join("; ")
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataTableShell>
  );
}
