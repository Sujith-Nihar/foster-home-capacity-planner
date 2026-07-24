"use client";

import Link from "next/link";
import { Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tableColumnClasses } from "@/components/ui/table-utils";
import {
  buildMeasurableAgeGroupRows,
  findHighestNeedAgeGroup,
  type AgeGroupRecruitmentRow,
  type MeasurableAgeGroupLabel,
} from "@/lib/recruitment/age-groups";
import { ageGroupSectionLabel } from "@/lib/recruitment/county-detail";
import type { CountyAgeMetricsDto } from "@/lib/types/domain";
import { formatCount, formatRatio } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

const RATIO_HELP_TEXT =
  "Children per matching active provider counts foster-home children divided by active providers whose current preferences include the age group.";

type CountyAgeGroupBreakdownProps = {
  ageGroups: CountyAgeMetricsDto[];
  countyLabel: string;
  countyHref?: string;
  panelId?: string;
  className?: string;
};

function HighestNeedBadge() {
  return (
    <Badge variant="outline" className="border-brand-blue/30 bg-brand-blue/5 text-brand-navy">
      Highest need
    </Badge>
  );
}

export function CountyAgeGroupSummary({
  highestNeed,
  compact = false,
}: {
  highestNeed: MeasurableAgeGroupLabel | null;
  compact?: boolean;
}) {
  if (!highestNeed) {
    return <span className="text-text-secondary">—</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="whitespace-nowrap text-sm text-text-primary">Ages {highestNeed}</span>
      {compact ? (
        <span className="whitespace-nowrap rounded-full border border-brand-blue/30 bg-brand-blue/5 px-2 py-0.5 text-[11px] font-medium text-brand-navy">
          Highest need
        </span>
      ) : (
        <HighestNeedBadge />
      )}
    </div>
  );
}

function BreakdownRatioHeader() {
  return (
    <div className="inline-flex items-center justify-end gap-1">
      <span>Children per matching active provider</span>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-text-tertiary hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="How children per matching active provider is calculated"
            />
          }
        >
          <Info className="size-3.5" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-left">{RATIO_HELP_TEXT}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function BreakdownRow({
  label,
  childrenCount,
  activeProviders,
  ratio,
  isHighestNeed,
  showRatio,
}: {
  label: string;
  childrenCount: number;
  activeProviders: number;
  ratio: number | null;
  isHighestNeed: boolean;
  showRatio: boolean;
}) {
  return (
    <TableRow className={cn(isHighestNeed ? "bg-brand-blue/5" : undefined)}>
      <TableCell className={cn("py-2", isHighestNeed ? "font-medium text-brand-navy" : undefined)}>
        <span className="whitespace-nowrap">{label}</span>
      </TableCell>
      <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
        {formatCount(childrenCount)} children
      </TableCell>
      <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
        {formatCount(activeProviders)} active providers
      </TableCell>
      <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
        {showRatio ? formatRatio(ratio) : "—"}
      </TableCell>
      <TableCell className="py-2">
        {isHighestNeed ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy">
            Highest
            <span className="sr-only"> relative attention for this county</span>
          </span>
        ) : (
          <span className="text-text-tertiary">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function MeasurableBreakdownRows({
  rows,
  highestNeed,
}: {
  rows: AgeGroupRecruitmentRow[];
  highestNeed: MeasurableAgeGroupLabel | null;
}) {
  return (
    <>
      {rows.map((row) => (
        <BreakdownRow
          key={row.ageGroup}
          label={`Ages ${row.ageGroup}`}
          childrenCount={row.currentFosterHomeChildren}
          activeProviders={row.matchingActiveProviders}
          ratio={row.childrenPerMatchingActiveProvider}
          isHighestNeed={row.ageGroup === highestNeed}
          showRatio
        />
      ))}
    </>
  );
}

export function CountyAgeGroupBreakdownTable({
  ageGroups,
  countyLabel,
  countyHref,
  panelId,
  className,
}: CountyAgeGroupBreakdownProps) {
  const measurableRows = buildMeasurableAgeGroupRows(ageGroups);
  const highestNeed = findHighestNeedAgeGroup(measurableRows);
  const unknownGroup = ageGroups.find((group) => group.ageGroup === "Unknown") ?? null;

  return (
    <div className="min-w-0 overflow-x-auto">
      <TooltipProvider>
        <div
          id={panelId}
          role="region"
          aria-label={`Age-group breakdown for ${countyLabel}`}
          className={className}
        >
          <Table layout="fixed" className="min-w-0 text-sm">
          <TableColgroup>
            <TableCol style={{ width: "16%" }} />
            <TableCol style={{ width: "22%" }} />
            <TableCol style={{ width: "24%" }} />
            <TableCol style={{ width: "22%" }} />
            <TableCol style={{ width: "16%" }} />
          </TableColgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="py-2">
                Age group
              </TableHead>
              <TableHead scope="col" className={`py-2 ${tableColumnClasses.numeric}`}>
                Foster-home children
              </TableHead>
              <TableHead scope="col" className={`py-2 ${tableColumnClasses.numeric}`}>
                Matching active providers
              </TableHead>
              <TableHead scope="col" className={`py-2 ${tableColumnClasses.numeric}`}>
                <BreakdownRatioHeader />
              </TableHead>
              <TableHead scope="col" className="py-2">
                Relative attention
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <MeasurableBreakdownRows rows={measurableRows} highestNeed={highestNeed} />
            {unknownGroup ? (
              <BreakdownRow
                label={ageGroupSectionLabel("Unknown")}
                childrenCount={unknownGroup.currentFosterHomeChildren}
                activeProviders={unknownGroup.matchingActiveProviders}
                ratio={null}
                isHighestNeed={false}
                showRatio={false}
              />
            ) : null}
          </TableBody>
        </Table>
        {countyHref ? (
          <p className="mt-3 text-sm">
            <Link
              href={countyHref}
              className="font-medium text-brand-navy underline-offset-4 hover:underline"
            >
              View complete county page for {countyLabel}
            </Link>
          </p>
        ) : null}
      </div>
    </TooltipProvider>
    </div>
  );
}
