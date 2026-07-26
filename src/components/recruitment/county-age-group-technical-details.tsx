"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

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
import { tableColumnClasses } from "@/components/ui/table-utils";
import { ageGroupSectionLabel } from "@/lib/recruitment/county-detail";
import { MEASURABLE_AGE_GROUP_LABELS } from "@/lib/recruitment/age-groups";
import type { StatewideAgeGroupBenchmark } from "@/lib/recruitment/age-groups";
import type { CountyAgeMetricsDto } from "@/lib/types/domain";
import { formatCount, formatRatio } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

import { TopQuarterBenchmarkTooltip } from "./top-quarter-benchmark-tooltip";

type CountyAgeGroupTechnicalDetailsProps = {
  ageGroups: CountyAgeMetricsDto[];
  benchmarkByAgeGroup: Map<string, StatewideAgeGroupBenchmark>;
};

export function CountyAgeGroupTechnicalDetails({
  ageGroups,
  benchmarkByAgeGroup,
}: CountyAgeGroupTechnicalDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
    requestAnimationFrame(() => {
      toggleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <div className="county-age-group-technical-details">
      <button
        ref={toggleRef}
        type="button"
        className="county-age-group-technical-details__toggle"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        <span>
          {isOpen ? "Hide technical comparison details" : "Show technical comparison details"}
        </span>
        <ChevronDown
          className={cn(
            "county-age-group-technical-details__chevron",
            isOpen && "county-age-group-technical-details__chevron--expanded",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="county-age-group-technical-details__panel"
      >
        {isOpen ? (
          <div className="data-table-viewport--scroll">
            <Table>
              <TableColgroup>
                <TableCol style={{ width: "18%" }} />
                <TableCol style={{ width: "22%" }} />
                <TableCol style={{ width: "30%" }} />
                <TableCol style={{ width: "30%" }} />
              </TableColgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col">Age group</TableHead>
                  <TableHead scope="col" className={tableColumnClasses.numeric}>
                    Matching licensed providers
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.numeric}>
                    Exact typical comparable-county value
                  </TableHead>
                  <TableHead scope="col" className={tableColumnClasses.numeric}>
                    <span className="inline-flex items-center justify-end gap-1">
                      Exact top-quarter benchmark
                      <TopQuarterBenchmarkTooltip />
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ageGroups.map((group) => {
                  const benchmark = MEASURABLE_AGE_GROUP_LABELS.includes(
                    group.ageGroup as (typeof MEASURABLE_AGE_GROUP_LABELS)[number],
                  )
                    ? benchmarkByAgeGroup.get(
                        group.ageGroup as (typeof MEASURABLE_AGE_GROUP_LABELS)[number],
                      )
                    : undefined;
                  const isUnknown = group.ageGroup === "Unknown";

                  return (
                    <TableRow
                      key={group.ageGroup}
                      className={isUnknown ? "text-text-tertiary" : undefined}
                    >
                      <TableCell>{ageGroupSectionLabel(group.ageGroup)}</TableCell>
                      <TableCell className={tableColumnClasses.numeric}>
                        {formatCount(group.matchingLicensedProviders)}
                      </TableCell>
                      <TableCell className={tableColumnClasses.numeric}>
                        {isUnknown || !benchmark ? "—" : formatRatio(benchmark.median)}
                      </TableCell>
                      <TableCell className={tableColumnClasses.numeric}>
                        {isUnknown || !benchmark ? "—" : formatRatio(benchmark.p75)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
