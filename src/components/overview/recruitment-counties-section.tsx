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
  TableMobileField,
  TableMobileItem,
  TableMobileList,
} from "@/components/ui/table-mobile-list";
import { tableColumnClasses } from "@/components/ui/table-utils";
import type { CountyMetricsDto } from "@/lib/types/domain";
import {
  formatCount,
  formatCountyName,
  formatRatio,
  formatRecruitmentPriorityLabel,
} from "@/lib/utils/formatters";

type RecruitmentCountiesSectionProps = {
  counties: CountyMetricsDto[];
};

export function RecruitmentCountiesSection({ counties }: RecruitmentCountiesSectionProps) {
  return (
    <DataTableShell
      actions={
        <Link
          href="/recruitment"
          className="text-sm font-medium text-brand-navy underline-offset-4 hover:underline"
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
        <>
          <TableMobileList>
            {counties.map((county) => (
              <TableMobileItem key={county.county}>
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/recruitment/${encodeURIComponent(county.county)}`}
                    className="font-medium text-brand-navy underline-offset-4 hover:underline"
                  >
                    {formatCountyName(county.county)}
                  </Link>
                  <PriorityBadge
                    level={priorityToAttentionLevel(county.recruitmentPriority)}
                    label={formatRecruitmentPriorityLabel(county.recruitmentPriority)}
                  />
                </div>
                <dl className="mt-3 space-y-2">
                  <TableMobileField
                    label="Foster-home children"
                    value={formatCount(county.currentFosterHomeChildren)}
                  />
                  <TableMobileField
                    label="Children per provider"
                    value={formatRatio(county.childrenPerActiveProvider)}
                  />
                </dl>
              </TableMobileItem>
            ))}
          </TableMobileList>

          <div className="table-desktop-only">
            <Table>
              <TableColgroup>
                <TableCol style={{ width: "34%" }} />
                <TableCol style={{ width: "24%" }} />
                <TableCol style={{ width: "21%" }} />
                <TableCol style={{ width: "21%" }} />
              </TableColgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col">County</TableHead>
                  <TableHead scope="col">Priority</TableHead>
                  <TableHead scope="col" className={tableColumnClasses.numeric}>
                    Foster-home children
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.numeric}>
                    Children per provider
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counties.map((county) => (
                  <TableRow key={county.county}>
                    <TableCell>
                      <Link
                        href={`/recruitment/${encodeURIComponent(county.county)}`}
                        className="block truncate font-medium text-brand-navy underline-offset-4 hover:underline"
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
                    <TableCell className={tableColumnClasses.numeric}>
                      {formatCount(county.currentFosterHomeChildren)}
                    </TableCell>
                    <TableCell className={tableColumnClasses.numeric}>
                      {formatRatio(county.childrenPerActiveProvider)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </DataTableShell>
  );
}
