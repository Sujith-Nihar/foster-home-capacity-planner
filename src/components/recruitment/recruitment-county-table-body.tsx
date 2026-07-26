"use client";

import Link from "next/link";
import { Info } from "lucide-react";

import { CountyHighestPressureSummary } from "@/components/recruitment/county-details-disclosure";
import { RecruitmentAttentionSummary } from "@/components/recruitment/recruitment-attention-summary";
import { RecruitmentSortHeader } from "@/components/recruitment/recruitment-filters";
import { RecruitmentSuggestedAttentionHelp } from "@/components/recruitment/recruitment-suggested-attention-help";
import { StackedTableCell } from "@/components/shared/stacked-table-cell";
import { TableViewActionLink } from "@/components/shared/table-view-action-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableMobileField, TableMobileItem, TableMobileList } from "@/components/ui/table-mobile-list";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  buildMeasurableAgeGroupRows,
  findHighestPressureAgeGroups,
  type MeasurableAgeGroupLabel,
} from "@/lib/recruitment/age-groups";
import type { CountyAgeMetricsDto, CountyMetricsDto } from "@/lib/types/domain";
import {
  formatCount,
  formatCountyName,
  formatNullablePercent,
  formatRatio,
} from "@/lib/utils/formatters";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

const HEADER_CELL = "operational-table-head-cell px-4 py-4 align-top sm:px-5";
const ROW_CELL = "operational-table-row-cell px-4 py-4 align-top sm:px-5";
const CHILDREN_PER_PROVIDER_HELP =
  "Foster-home children divided by engaged local providers. This describes placement pressure, not available beds or vacancies.";

type RecruitmentCountyTableBodyProps = {
  counties: CountyMetricsDto[];
  countyAgeMetricsByCounty: Record<string, CountyAgeMetricsDto[]>;
  searchParams: RecruitmentSearchParams;
};

function countyHref(county: string): string {
  return `/recruitment/${encodeURIComponent(county)}`;
}

function ProviderBaseSummary({ county }: { county: CountyMetricsDto }) {
  return (
    <StackedTableCell
      primary={
        <span className="tabular-nums">
          {formatCount(county.currentFosterHomeChildren)} foster-home children
        </span>
      }
      secondary={
        <span className="tabular-nums">
          {formatCount(county.activeProviders)} engaged providers
        </span>
      }
    />
  );
}

function PlacementPressureSummary({ county }: { county: CountyMetricsDto }) {
  const ratio = formatRatio(county.childrenPerActiveProvider);
  const outOfCounty = formatNullablePercent(county.outOfCountyFosterRate);

  return (
    <StackedTableCell
      primary={
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="inline-flex cursor-help items-center gap-1 tabular-nums underline decoration-dotted underline-offset-2">
                {ratio} children per engaged provider
                <Info className="size-3.5 shrink-0 text-text-tertiary" aria-hidden="true" />
              </span>
            }
          />
          <TooltipContent className="max-w-xs text-left">{CHILDREN_PER_PROVIDER_HELP}</TooltipContent>
        </Tooltip>
      }
      secondary={<span className="tabular-nums">{outOfCounty} placed out of county</span>}
    />
  );
}

function PressureAndAgeSummary({
  county,
  highestGroups,
}: {
  county: CountyMetricsDto;
  highestGroups: MeasurableAgeGroupLabel[];
}) {
  return (
    <div className="min-w-0 space-y-2">
      <PlacementPressureSummary county={county} />
      <CountyHighestPressureSummary highestGroups={highestGroups} />
    </div>
  );
}

function formatLicenseExposure(count: number): string {
  if (count <= 0) {
    return "No licenses ending within 90 days";
  }
  return `${formatCount(count)} licenses ending within 90 days`;
}

function RenewalAndActionCell({ county }: { county: CountyMetricsDto }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2">
      <p className="text-sm tabular-nums text-text-primary">{formatLicenseExposure(county.expiring90Days)}</p>
      <TableViewActionLink href={countyHref(county.county)} label="View county" />
    </div>
  );
}

function RecruitmentCountyCard({
  county,
  highestGroups,
}: {
  county: CountyMetricsDto;
  highestGroups: MeasurableAgeGroupLabel[];
}) {
  const countyLabel = formatCountyName(county.county);

  return (
    <TableMobileItem>
      <Link
        href={countyHref(county.county)}
        className="font-medium text-brand-navy underline-offset-4 hover:underline"
      >
        {countyLabel}
      </Link>
      <dl className="mt-3 space-y-3">
        <TableMobileField
          label="Suggested attention"
          value={<RecruitmentAttentionSummary county={county} />}
        />
        <TableMobileField label="Provider base" value={<ProviderBaseSummary county={county} />} />
        <TableMobileField label="Placement pressure" value={<PlacementPressureSummary county={county} />} />
        <TableMobileField
          label="Age focus"
          value={<CountyHighestPressureSummary highestGroups={highestGroups} />}
        />
        <TableMobileField
          label="Near-term license exposure"
          value={
            <span className="tabular-nums">
              {formatLicenseExposure(county.expiring90Days)}
            </span>
          }
        />
      </dl>
      <div className="mt-3 border-t border-border-subtle pt-3">
        <TableViewActionLink href={countyHref(county.county)} label="View county" />
      </div>
    </TableMobileItem>
  );
}

export function RecruitmentCountyTableBody({
  counties,
  countyAgeMetricsByCounty,
  searchParams,
}: RecruitmentCountyTableBodyProps) {
  return (
    <TooltipProvider>
      <TableMobileList>
        {counties.map((county) => {
          const ageGroups = countyAgeMetricsByCounty[county.county] ?? [];
          const highestGroups = findHighestPressureAgeGroups(buildMeasurableAgeGroupRows(ageGroups));

          return (
            <RecruitmentCountyCard key={county.county} county={county} highestGroups={highestGroups} />
          );
        })}
      </TableMobileList>

      <div className="table-desktop-only min-w-0">
        <Table className="w-full min-w-0 table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className={`${HEADER_CELL} w-[15%]`}>
                County
              </TableHead>
              <TableHead scope="col" className={`${HEADER_CELL} w-[20%]`}>
                <div className="inline-flex items-start gap-1.5">
                  <RecruitmentSortHeader
                    label="Suggested attention"
                    sortKey="recruitment_priority"
                    searchParams={searchParams}
                  />
                  <RecruitmentSuggestedAttentionHelp />
                </div>
              </TableHead>
              <TableHead scope="col" className={`${HEADER_CELL} w-[17%]`}>
                Provider base
              </TableHead>
              <TableHead
                scope="col"
                className={`${HEADER_CELL} w-[19%] hidden xl:table-cell`}
              >
                Placement pressure
              </TableHead>
              <TableHead
                scope="col"
                className={`${HEADER_CELL} w-[13%] hidden xl:table-cell`}
              >
                Age focus
              </TableHead>
              <TableHead
                scope="col"
                className={`${HEADER_CELL} w-[29%] xl:hidden`}
              >
                Pressure and age focus
              </TableHead>
              <TableHead
                scope="col"
                className={`${HEADER_CELL} w-[16%] hidden xl:table-cell`}
              >
                Near-term license exposure
              </TableHead>
              <TableHead
                scope="col"
                className={`${HEADER_CELL} w-[11%] xl:hidden`}
              >
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {counties.map((county) => {
              const countyLabel = formatCountyName(county.county);
              const ageGroups = countyAgeMetricsByCounty[county.county] ?? [];
              const highestGroups = findHighestPressureAgeGroups(buildMeasurableAgeGroupRows(ageGroups));

              return (
                <TableRow key={county.county}>
                  <TableCell className={`${ROW_CELL} min-w-0 font-medium`}>
                    <Link
                      href={countyHref(county.county)}
                      className="text-brand-navy underline-offset-4 hover:underline"
                    >
                      {countyLabel}
                    </Link>
                  </TableCell>
                  <TableCell className={`${ROW_CELL} min-w-0`}>
                    <RecruitmentAttentionSummary county={county} />
                    {county.expiring90Days > 0 ? (
                      <p className="mt-1 text-xs tabular-nums text-text-secondary xl:hidden">
                        {formatLicenseExposure(county.expiring90Days)}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className={`${ROW_CELL} min-w-0`}>
                    <ProviderBaseSummary county={county} />
                  </TableCell>
                  <TableCell className={`${ROW_CELL} min-w-0 hidden xl:table-cell`}>
                    <PlacementPressureSummary county={county} />
                  </TableCell>
                  <TableCell className={`${ROW_CELL} min-w-0 hidden xl:table-cell`}>
                    <CountyHighestPressureSummary highestGroups={highestGroups} />
                  </TableCell>
                  <TableCell className={`${ROW_CELL} min-w-0 xl:hidden`}>
                    <PressureAndAgeSummary county={county} highestGroups={highestGroups} />
                  </TableCell>
                  <TableCell className={`${ROW_CELL} min-w-0 hidden xl:table-cell`}>
                    <RenewalAndActionCell county={county} />
                  </TableCell>
                  <TableCell className={`${ROW_CELL} min-w-0 xl:hidden`}>
                    <TableViewActionLink href={countyHref(county.county)} label="View county" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
