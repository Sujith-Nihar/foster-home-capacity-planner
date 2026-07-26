import { Badge } from "@/components/ui/badge";
import { DataTableShell } from "@/components/data-table-shell";
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
import {
  ageGroupSectionLabel,
  interpretAgeGroupCountyComparison,
} from "@/lib/recruitment/county-detail";
import {
  buildMeasurableAgeGroupRows,
  findHighestPressureAgeGroups,
  MEASURABLE_AGE_GROUP_LABELS,
  type StatewideAgeGroupBenchmark,
} from "@/lib/recruitment/age-groups";
import type { CountyAgeMetricsDto } from "@/lib/types/domain";
import { formatCount, formatRatio } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

import { CountyAgeGroupTechnicalDetails } from "./county-age-group-technical-details";

type CountyAgeGroupFocusProps = {
  ageGroups: CountyAgeMetricsDto[];
  statewideAgeGroupBenchmarks: StatewideAgeGroupBenchmark[];
};

export function CountyAgeGroupFocus({
  ageGroups,
  statewideAgeGroupBenchmarks,
}: CountyAgeGroupFocusProps) {
  const benchmarkByAgeGroup = new Map(
    statewideAgeGroupBenchmarks.map((benchmark) => [benchmark.ageGroup, benchmark]),
  );
  const measurableRows = buildMeasurableAgeGroupRows(ageGroups);
  const highestPressureGroups = findHighestPressureAgeGroups(measurableRows);

  return (
    <section aria-labelledby="county-age-pressure-heading">
      <DataTableShell
        titleId="county-age-pressure-heading"
        title="Age-group recruitment focus"
        description="Compare children with engaged providers whose current age preferences include each age group."
      >
        {ageGroups.length === 0 ? (
          <p className="px-4 py-6 text-sm text-text-secondary" role="status">
            No age-group pressure metrics are available for this county.
          </p>
        ) : (
          <div className="county-age-group-table-shell min-w-0">
            <div className="data-table-viewport--scroll">
              <Table>
                <TableColgroup>
                  <TableCol style={{ width: "18%" }} />
                  <TableCol style={{ width: "16%" }} />
                  <TableCol style={{ width: "18%" }} />
                  <TableCol style={{ width: "22%" }} />
                  <TableCol style={{ width: "26%" }} />
                </TableColgroup>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead scope="col">Age group</TableHead>
                    <TableHead scope="col" className={tableColumnClasses.numeric}>
                      Foster-home children
                    </TableHead>
                    <TableHead scope="col" className={tableColumnClasses.numeric}>
                      Matching engaged providers
                    </TableHead>
                    <TableHead scope="col" className={tableColumnClasses.numeric}>
                      Children per matching engaged provider
                    </TableHead>
                    <TableHead scope="col">Comparison with similar counties</TableHead>
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
                    const isHighest =
                      !isUnknown &&
                      highestPressureGroups.includes(
                        group.ageGroup as (typeof MEASURABLE_AGE_GROUP_LABELS)[number],
                      );
                    const interpretation = interpretAgeGroupCountyComparison(
                      group.childrenPerMatchingActiveProvider,
                      benchmark,
                    );

                    return (
                      <TableRow
                        key={group.ageGroup}
                        className={cn(
                          isHighest && "bg-brand-blue/5",
                          isUnknown && "text-text-tertiary",
                        )}
                      >
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(isHighest && "font-medium text-brand-navy")}>
                              {ageGroupSectionLabel(group.ageGroup)}
                            </span>
                            {isHighest ? (
                              <Badge
                                variant="outline"
                                className="border-brand-blue/30 bg-brand-blue/5 text-brand-navy"
                              >
                                Highest pressure
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className={tableColumnClasses.numeric}>
                          {formatCount(group.currentFosterHomeChildren)}
                        </TableCell>
                        <TableCell className={tableColumnClasses.numeric}>
                          {formatCount(group.matchingActiveProviders)}
                        </TableCell>
                        <TableCell className={tableColumnClasses.numeric}>
                          {isUnknown ? "—" : formatRatio(group.childrenPerMatchingActiveProvider)}
                        </TableCell>
                        <TableCell>
                          <span className={isUnknown ? "text-text-tertiary" : undefined}>
                            {isUnknown ? "Not calculated" : interpretation}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <CountyAgeGroupTechnicalDetails
              ageGroups={ageGroups}
              benchmarkByAgeGroup={benchmarkByAgeGroup}
            />
          </div>
        )}
      </DataTableShell>
    </section>
  );
}
