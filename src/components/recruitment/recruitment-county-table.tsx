import type { ReactNode } from "react";
import Link from "next/link";

import { DataTableShell } from "@/components/data-table-shell";
import { RecruitmentSortHeader } from "@/components/recruitment/recruitment-filters";
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
import { tableColumnClasses, TruncateCell } from "@/components/ui/table-utils";
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

function RecruitmentCountyMobileList({ counties }: { counties: CountyMetricsDto[] }) {
  return (
    <TableMobileList>
      {counties.map((county) => {
        const reasons =
          county.recruitmentReasons.length > 0 ? county.recruitmentReasons.join("; ") : "—";

        return (
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
            <TableMobileDetails summary="View additional county metrics">
              <TableMobileField
                label="Active providers"
                value={formatCount(county.activeProviders)}
              />
              <TableMobileField
                label="Out-of-county"
                value={formatNullablePercent(county.outOfCountyFosterRate)}
              />
              <TableMobileField
                label="Age-group pressure"
                value={county.highestPressureAgeGroup ?? "—"}
              />
              <TableMobileField
                label="Expiring licenses"
                value={formatCount(county.expiring90Days)}
              />
              <TableMobileField label="Reasons" value={reasons} />
            </TableMobileDetails>
          </TableMobileItem>
        );
      })}
    </TableMobileList>
  );
}

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
        <>
          <RecruitmentCountyMobileList counties={counties} />

          <div className="table-desktop-only data-table-viewport--scroll">
            <Table>
              <TableColgroup>
                <TableCol style={{ width: "14%" }} />
                <TableCol style={{ width: "12%" }} />
                <TableCol style={{ width: "10%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "9%" }} />
                <TableCol style={{ width: "11%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "9%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "12%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "9%" }} />
                <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "14%" }} />
              </TableColgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col">County</TableHead>
                  <TableHead scope="col">
                    <RecruitmentSortHeader
                      label="Priority"
                      sortKey="recruitment_priority"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.numeric}>
                    <RecruitmentSortHeader
                      label="Foster-home children"
                      sortKey="current_foster_home_children"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                    Active providers
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.numeric}>
                    <RecruitmentSortHeader
                      label="Children per provider"
                      sortKey="children_per_active_provider"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                    <RecruitmentSortHeader
                      label="Out-of-county"
                      sortKey="out_of_county_foster_rate"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.tabletHidden}>
                    Age-group pressure
                  </TableHead>
                  <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                    <RecruitmentSortHeader
                      label="Expiring licenses"
                      sortKey="expiring_90_days"
                      searchParams={searchParams}
                    />
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.tabletHidden}>
                    Reasons
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counties.map((county) => {
                  const reasons =
                    county.recruitmentReasons.length > 0
                      ? county.recruitmentReasons.join("; ")
                      : "—";

                  return (
                    <TableRow key={county.county}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/recruitment/${encodeURIComponent(county.county)}`}
                          className="block truncate text-brand-navy underline-offset-4 hover:underline"
                          title={formatCountyName(county.county)}
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
                      <TableCell className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                        {formatCount(county.activeProviders)}
                      </TableCell>
                      <TableCell className={tableColumnClasses.numeric}>
                        {formatRatio(county.childrenPerActiveProvider)}
                      </TableCell>
                      <TableCell className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                        {formatNullablePercent(county.outOfCountyFosterRate)}
                      </TableCell>
                      <TableCell className={tableColumnClasses.tabletHidden}>
                        <TruncateCell lines={1}>
                          {county.highestPressureAgeGroup ?? "—"}
                        </TruncateCell>
                      </TableCell>
                      <TableCell className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                        {formatCount(county.expiring90Days)}
                      </TableCell>
                      <TableCell className={tableColumnClasses.tabletHidden}>
                        <TruncateCell title={reasons}>{reasons}</TruncateCell>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </DataTableShell>
  );
}
