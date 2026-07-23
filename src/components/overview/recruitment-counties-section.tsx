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
import type { CountyMetricsDto } from "@/lib/types/domain";
import { formatCount, formatCountyName, formatRatio, formatRecruitmentPriorityLabel } from "@/lib/utils/formatters";

type RecruitmentCountiesSectionProps = {
  counties: CountyMetricsDto[];
};

export function RecruitmentCountiesSection({ counties }: RecruitmentCountiesSectionProps) {
  return (
    <section aria-labelledby="recruitment-counties-heading">
      <DataTableShell
        titleId="recruitment-counties-heading"
        title="Top recruitment-pressure counties"
        description="Counties ranked by children per active provider, excluding limited-data counties."
        actions={
          <Link
            href="/recruitment"
            className="text-sm font-medium text-accent-brand underline-offset-4 hover:underline"
          >
            View all counties
          </Link>
        }
      >
        {counties.length === 0 ? (
          <p className="px-4 py-6 text-sm text-text-secondary" role="status">
            No county recruitment rankings are available for the reporting date.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">County</TableHead>
                <TableHead scope="col">Priority</TableHead>
                <TableHead scope="col" className="text-right">
                  Foster-home children
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Children per active provider
                </TableHead>
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
                    {formatRatio(county.childrenPerActiveProvider)}
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
