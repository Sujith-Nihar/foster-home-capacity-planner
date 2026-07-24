"use client";

import { useId, useState } from "react";
import Link from "next/link";

import { CountyBreakdownToggleButton } from "@/components/recruitment/county-breakdown-toggle-button";
import {
  CountyAgeGroupBreakdownTable,
  CountyAgeGroupSummary,
} from "@/components/recruitment/county-age-group-breakdown";
import {
  PriorityBadgeWithReasons,
  PriorityBadgeWithReasonsProvider,
} from "@/components/recruitment/priority-badge-with-reasons";
import { RecruitmentSortHeader } from "@/components/recruitment/recruitment-filters";
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
import { findHighestNeedAgeGroup, buildMeasurableAgeGroupRows } from "@/lib/recruitment/age-groups";
import type { CountyAgeMetricsDto, CountyMetricsDto } from "@/lib/types/domain";
import {
  formatCount,
  formatCountyName,
  formatNullablePercent,
  formatRatio,
} from "@/lib/utils/formatters";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

const COMPACT_CELL = "py-2";
const ACTION_COL_WIDTH = "165px";
const COLUMN_COUNT = 9;

type RecruitmentCountyTableBodyProps = {
  counties: CountyMetricsDto[];
  countyAgeMetricsByCounty: Record<string, CountyAgeMetricsDto[]>;
  searchParams: RecruitmentSearchParams;
};

function allReasons(county: CountyMetricsDto): string {
  return county.recruitmentReasons.length > 0 ? county.recruitmentReasons.join("; ") : "—";
}

function countyHref(county: string): string {
  return `/recruitment/${encodeURIComponent(county)}`;
}

function RecruitmentCountyMobileList({
  counties,
  countyAgeMetricsByCounty,
  expandedCounty,
  onToggleCounty,
}: {
  counties: CountyMetricsDto[];
  countyAgeMetricsByCounty: Record<string, CountyAgeMetricsDto[]>;
  expandedCounty: string | null;
  onToggleCounty: (county: string) => void;
}) {
  return (
    <TableMobileList>
      {counties.map((county) => {
        const countyLabel = formatCountyName(county.county);
        const ageGroups = countyAgeMetricsByCounty[county.county] ?? [];
        const panelId = `county-age-breakdown-mobile-${county.county.replace(/\s+/g, "-")}`;
        const isExpanded = expandedCounty === county.county;
        const measurableRows = buildMeasurableAgeGroupRows(ageGroups);
        const highestNeed = findHighestNeedAgeGroup(measurableRows);
        const reasons = allReasons(county);

        return (
          <TableMobileItem key={county.county}>
            <div className="flex items-start justify-between gap-3">
              <Link
                href={countyHref(county.county)}
                className="font-medium text-brand-navy underline-offset-4 hover:underline"
              >
                {countyLabel}
              </Link>
              <PriorityBadgeWithReasons county={county} />
            </div>
            <dl className="mt-3 space-y-2">
              <TableMobileField
                label="Foster-home children"
                value={formatCount(county.currentFosterHomeChildren)}
              />
              <TableMobileField
                label="Active providers"
                value={formatCount(county.activeProviders)}
              />
              <TableMobileField
                label="Highest-need age group"
                value={<CountyAgeGroupSummary highestNeed={highestNeed} compact />}
              />
            </dl>
            <TableMobileDetails summary="View additional county metrics">
              <TableMobileField
                label="Children per provider"
                value={formatRatio(county.childrenPerActiveProvider)}
              />
              <TableMobileField
                label="Out-of-county"
                value={formatNullablePercent(county.outOfCountyFosterRate)}
              />
              <TableMobileField
                label="Expiring licenses"
                value={formatCount(county.expiring90Days)}
              />
              {county.recruitmentReasons.length > 0 ? (
                <TableMobileField label="Planning reasons" value={reasons} />
              ) : null}
            </TableMobileDetails>
            <div className="mt-3 border-t border-border-subtle pt-3">
              <CountyBreakdownToggleButton
                isExpanded={isExpanded}
                panelId={panelId}
                onToggle={() => onToggleCounty(county.county)}
                className="w-full justify-between"
              />
              {isExpanded ? (
                <div className="mt-3 min-w-0">
                  <CountyAgeGroupBreakdownTable
                    ageGroups={ageGroups}
                    countyLabel={countyLabel}
                    countyHref={countyHref(county.county)}
                    panelId={panelId}
                  />
                  {county.recruitmentReasons.length > 0 ? (
                    <p className="mt-3 text-sm text-text-secondary">
                      <span className="font-medium text-text-primary">Planning reasons:</span>{" "}
                      {reasons}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </TableMobileItem>
        );
      })}
    </TableMobileList>
  );
}

export function RecruitmentCountyTableBody({
  counties,
  countyAgeMetricsByCounty,
  searchParams,
}: RecruitmentCountyTableBodyProps) {
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);
  const tableId = useId();

  const toggleCounty = (county: string) => {
    setExpandedCounty((current) => (current === county ? null : county));
  };

  return (
    <PriorityBadgeWithReasonsProvider>
      <RecruitmentCountyMobileList
        counties={counties}
        countyAgeMetricsByCounty={countyAgeMetricsByCounty}
        expandedCounty={expandedCounty}
        onToggleCounty={toggleCounty}
      />

      <div className="table-desktop-only min-w-0 data-table-viewport--scroll">
        <Table id={tableId} className="min-w-0">
          <TableColgroup>
            <TableCol style={{ width: "13%" }} />
            <TableCol style={{ width: "12%" }} />
            <TableCol style={{ width: "10%" }} />
            <TableCol style={{ width: "9%" }} />
            <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "9%" }} />
            <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "8%" }} />
            <TableCol className="hidden md:table-cell" style={{ width: "11%" }} />
            <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "7%" }} />
            <TableCol className="hidden md:table-cell" style={{ width: ACTION_COL_WIDTH, minWidth: ACTION_COL_WIDTH }} />
          </TableColgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className={COMPACT_CELL}>
                County
              </TableHead>
              <TableHead scope="col" className={COMPACT_CELL}>
                <RecruitmentSortHeader
                  label="Suggested attention"
                  sortKey="recruitment_priority"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className={`${COMPACT_CELL} ${tableColumnClasses.numeric}`}>
                <RecruitmentSortHeader
                  label="Foster-home children"
                  sortKey="current_foster_home_children"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className={`${COMPACT_CELL} ${tableColumnClasses.numeric}`}>
                Active providers
              </TableHead>
              <TableHead
                scope="col"
                className={`${COMPACT_CELL} ${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}
              >
                <RecruitmentSortHeader
                  label="Children per provider"
                  sortKey="children_per_active_provider"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead
                scope="col"
                className={`${COMPACT_CELL} ${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}
              >
                <RecruitmentSortHeader
                  label="Out-of-county"
                  sortKey="out_of_county_foster_rate"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead scope="col" className={`hidden md:table-cell ${COMPACT_CELL}`}>
                Highest-need age group
              </TableHead>
              <TableHead
                scope="col"
                className={`${COMPACT_CELL} ${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}
              >
                <RecruitmentSortHeader
                  label="Expiring licenses"
                  sortKey="expiring_90_days"
                  searchParams={searchParams}
                />
              </TableHead>
              <TableHead
                scope="col"
                className={`hidden md:table-cell ${COMPACT_CELL} pr-4`}
                style={{ width: ACTION_COL_WIDTH }}
              >
                <span className="sr-only">Age breakdown</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {counties.map((county) => {
              const countyLabel = formatCountyName(county.county);
              const ageGroups = countyAgeMetricsByCounty[county.county] ?? [];
              const measurableRows = buildMeasurableAgeGroupRows(ageGroups);
              const highestNeed = findHighestNeedAgeGroup(measurableRows);
              const panelId = `county-age-breakdown-${county.county.replace(/\s+/g, "-")}`;
              const isExpanded = expandedCounty === county.county;
              const reasons = allReasons(county);

              return (
                <CountyTableRows
                  key={county.county}
                  county={county}
                  countyLabel={countyLabel}
                  ageGroups={ageGroups}
                  highestNeed={highestNeed}
                  panelId={panelId}
                  isExpanded={isExpanded}
                  reasons={reasons}
                  onToggle={() => toggleCounty(county.county)}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </PriorityBadgeWithReasonsProvider>
  );
}

function CountyTableRows({
  county,
  countyLabel,
  ageGroups,
  highestNeed,
  panelId,
  isExpanded,
  reasons,
  onToggle,
}: {
  county: CountyMetricsDto;
  countyLabel: string;
  ageGroups: CountyAgeMetricsDto[];
  highestNeed: ReturnType<typeof findHighestNeedAgeGroup>;
  panelId: string;
  isExpanded: boolean;
  reasons: string;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow>
        <TableCell className={`${COMPACT_CELL} max-w-0 font-medium`}>
          <Link
            href={countyHref(county.county)}
            className="block truncate text-brand-navy underline-offset-4 hover:underline"
            title={countyLabel}
          >
            {countyLabel}
          </Link>
        </TableCell>
        <TableCell className={COMPACT_CELL}>
          <PriorityBadgeWithReasons county={county} />
        </TableCell>
        <TableCell className={`${COMPACT_CELL} ${tableColumnClasses.numeric}`}>
          {formatCount(county.currentFosterHomeChildren)}
        </TableCell>
        <TableCell className={`${COMPACT_CELL} ${tableColumnClasses.numeric}`}>
          {formatCount(county.activeProviders)}
        </TableCell>
        <TableCell
          className={`${COMPACT_CELL} ${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}
        >
          {formatRatio(county.childrenPerActiveProvider)}
        </TableCell>
        <TableCell
          className={`${COMPACT_CELL} ${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}
        >
          {formatNullablePercent(county.outOfCountyFosterRate)}
        </TableCell>
        <TableCell className={`hidden md:table-cell ${COMPACT_CELL}`}>
          <CountyAgeGroupSummary highestNeed={highestNeed} compact />
        </TableCell>
        <TableCell
          className={`${COMPACT_CELL} ${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}
        >
          {formatCount(county.expiring90Days)}
        </TableCell>
        <TableCell
          className={`hidden md:table-cell ${COMPACT_CELL} px-2`}
          style={{ width: ACTION_COL_WIDTH, minWidth: ACTION_COL_WIDTH, maxWidth: ACTION_COL_WIDTH }}
        >
          <CountyBreakdownToggleButton
            isExpanded={isExpanded}
            panelId={panelId}
            onToggle={onToggle}
          />
        </TableCell>
      </TableRow>
      {isExpanded ? (
        <TableRow className="bg-surface-tint/30 hover:bg-surface-tint/30">
          <TableCell colSpan={COLUMN_COUNT} className="min-w-0 px-4 py-3">
            <CountyAgeGroupBreakdownTable
              ageGroups={ageGroups}
              countyLabel={countyLabel}
              countyHref={countyHref(county.county)}
              panelId={panelId}
            />
            {county.recruitmentReasons.length > 0 ? (
              <p className="mt-3 text-sm text-text-secondary">
                <span className="font-medium text-text-primary">Planning reasons:</span> {reasons}
              </p>
            ) : null}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
