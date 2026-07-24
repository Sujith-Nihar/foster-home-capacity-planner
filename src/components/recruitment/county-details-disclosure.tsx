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
  findHighestPressureAgeGroups,
  type MeasurableAgeGroupLabel,
  type StatewideAgeGroupBenchmark,
} from "@/lib/recruitment/age-groups";
import { ageGroupSectionLabel } from "@/lib/recruitment/county-detail";
import type { CountyAgeMetricsDto, CountyMetricsDto } from "@/lib/types/domain";
import { formatCount, formatRatio } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

const RATIO_HELP_TEXT =
  "Children per matching engaged provider counts foster-home children divided by engaged providers whose current preferences include the age group.";

type CountyDetailsDisclosureProps = {
  county: CountyMetricsDto;
  countyLabel: string;
  ageGroups: CountyAgeMetricsDto[];
  benchmarks: StatewideAgeGroupBenchmark[];
  countyHref: string;
  panelId?: string;
  className?: string;
};

function BreakdownRatioHeader() {
  return (
    <div className="inline-flex items-center justify-end gap-1">
      <span className="text-xs leading-snug">Children per matching engaged provider</span>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-text-tertiary hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="How children per matching engaged provider is calculated"
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

export function CountyDetailsDisclosure({
  county,
  countyLabel,
  ageGroups,
  benchmarks,
  countyHref,
  panelId,
  className,
}: CountyDetailsDisclosureProps) {
  const measurableRows = buildMeasurableAgeGroupRows(ageGroups);
  const highestPressureGroups = findHighestPressureAgeGroups(measurableRows);
  const benchmarkByLabel = new Map(benchmarks.map((item) => [item.ageGroup, item]));
  const byLabel = new Map(ageGroups.map((group) => [group.ageGroup, group]));
  const unknownGroup = byLabel.get("Unknown") ?? null;

  return (
    <TooltipProvider>
      <div
        id={panelId}
        role="region"
        aria-label={`County details for ${countyLabel}`}
        className={cn("min-w-0", className)}
      >
        <div className="overflow-x-auto">
          <Table layout="fixed" className="min-w-[720px] text-sm">
            <TableColgroup>
              <TableCol style={{ width: "12%" }} />
              <TableCol style={{ width: "12%" }} />
              <TableCol style={{ width: "14%" }} />
              <TableCol style={{ width: "14%" }} />
              <TableCol style={{ width: "14%" }} />
              <TableCol style={{ width: "11%" }} />
              <TableCol style={{ width: "11%" }} />
              <TableCol style={{ width: "12%" }} />
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
                  Matching licensed providers
                </TableHead>
                <TableHead scope="col" className={`py-2 ${tableColumnClasses.numeric}`}>
                  Matching engaged providers
                </TableHead>
                <TableHead scope="col" className={`py-2 ${tableColumnClasses.numeric}`}>
                  <BreakdownRatioHeader />
                </TableHead>
                <TableHead scope="col" className={`py-2 ${tableColumnClasses.numeric}`}>
                  Statewide median
                </TableHead>
                <TableHead scope="col" className={`py-2 ${tableColumnClasses.numeric}`}>
                  Statewide 75th
                </TableHead>
                <TableHead scope="col" className="py-2">
                  Relative attention
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurableRows.map((row) => {
                const source = byLabel.get(row.ageGroup);
                const benchmark = benchmarkByLabel.get(row.ageGroup);
                const isHighest = highestPressureGroups.includes(row.ageGroup);
                const isTied = isHighest && highestPressureGroups.length > 1;

                return (
                  <TableRow key={row.ageGroup} className={isHighest ? "bg-brand-blue/5" : undefined}>
                    <TableCell className={cn("py-2", isHighest ? "font-medium text-brand-navy" : undefined)}>
                      <span className="whitespace-nowrap">Ages {row.ageGroup}</span>
                    </TableCell>
                    <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
                      {formatCount(row.currentFosterHomeChildren)}
                    </TableCell>
                    <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
                      {formatCount(source?.matchingLicensedProviders ?? 0)}
                    </TableCell>
                    <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
                      {formatCount(row.matchingActiveProviders)}
                    </TableCell>
                    <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
                      {formatRatio(row.childrenPerMatchingActiveProvider)}
                    </TableCell>
                    <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
                      {formatRatio(benchmark?.median ?? null)}
                    </TableCell>
                    <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
                      {formatRatio(benchmark?.p75 ?? null)}
                    </TableCell>
                    <TableCell className="py-2">
                      {isHighest ? (
                        <Badge variant="outline" className="border-brand-blue/30 bg-brand-blue/5 text-brand-navy">
                          {isTied ? "Tied highest" : "Highest"}
                        </Badge>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {unknownGroup ? (
                <TableRow>
                  <TableCell className="py-2">{ageGroupSectionLabel("Unknown")}</TableCell>
                  <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
                    {formatCount(unknownGroup.currentFosterHomeChildren)}
                  </TableCell>
                  <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
                    {formatCount(unknownGroup.matchingLicensedProviders)}
                  </TableCell>
                  <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>
                    {formatCount(unknownGroup.matchingActiveProviders)}
                  </TableCell>
                  <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>—</TableCell>
                  <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>—</TableCell>
                  <TableCell className={`py-2 ${tableColumnClasses.numeric}`}>—</TableCell>
                  <TableCell className="py-2">—</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        {county.recruitmentReasons.length > 0 ? (
          <div className="mt-4 rounded-lg border border-border-subtle bg-surface-raised px-4 py-3">
            <h3 className="text-sm font-medium text-text-primary">Recruitment reasons</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-text-secondary">
              {county.recruitmentReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-4 text-sm">
          <Link
            href={countyHref}
            className="font-medium text-brand-navy underline-offset-4 hover:underline"
          >
            View complete county page for {countyLabel}
          </Link>
        </p>
      </div>
    </TooltipProvider>
  );
}

export function CountyHighestPressureSummary({
  highestGroups,
}: {
  highestGroups: MeasurableAgeGroupLabel[];
}) {
  if (highestGroups.length === 0) {
    return <span className="text-text-secondary">—</span>;
  }

  const label =
    highestGroups.length === 1
      ? `Ages ${highestGroups[0]}`
      : `Ages ${highestGroups.map((group) => group).join(" and ")}`;

  return (
    <div className="min-w-0">
      <p className="whitespace-nowrap text-sm text-text-primary">{label}</p>
      <p className="whitespace-nowrap text-[11px] text-text-secondary">
        {highestGroups.length > 1 ? "Tied highest pressure" : "Highest pressure"}
      </p>
    </div>
  );
}
