import {
  Baby,
  Building2,
  Clock,
  HeartHandshake,
  MapPin,
  Users,
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { CountyLimitationsPanel } from "@/components/recruitment/county-limitations-panel";
import { CountyRetentionTable } from "@/components/recruitment/county-retention-table";
import { ReasonList } from "@/components/reason-list";
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
import type { CountyPageData } from "@/lib/data/counties";
import { ageGroupSectionLabel } from "@/lib/recruitment/county-detail";
import { MEASURABLE_AGE_GROUP_LABELS } from "@/lib/recruitment/age-groups";
import {
  formatCount,
  formatNullablePercent,
  formatRatio,
} from "@/lib/utils/formatters";

type CountyDetailPageContentProps = {
  data: CountyPageData;
};

export function CountyDetailPageContent({ data }: CountyDetailPageContentProps) {
  const {
    county,
    ageGroups,
    statewideAgeGroupBenchmarks,
    retentionProviders,
    retentionPagination,
    limitations,
  } = data;

  const benchmarkByAgeGroup = new Map(
    statewideAgeGroupBenchmarks.map((benchmark) => [benchmark.ageGroup, benchmark]),
  );

  return (
    <div className="space-y-8">
      {county.recruitmentReasons.length > 0 ? (
        <ReasonList title="Readable priority reasons" reasons={county.recruitmentReasons} headingLevel="h2" />
      ) : null}

      <section aria-labelledby="county-demand-heading" className="space-y-4">
        <h2 id="county-demand-heading" className="text-lg font-semibold text-text-primary">
          Current placement demand
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Current foster-home children"
            value={formatCount(county.currentFosterHomeChildren)}
            helperText="Primary recruitment demand signal"
            icon={<Baby className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Current kin placements"
            value={formatCount(county.currentKinChildren)}
            helperText="Shown separately for context"
            icon={<HeartHandshake className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Current nonfamily placements"
            value={formatCount(county.currentNonfamilyChildren)}
            helperText="Shown separately for context"
            icon={<Building2 className="size-4" aria-hidden="true" />}
          />
        </div>
      </section>

      <section aria-labelledby="county-provider-heading" className="space-y-4">
        <h2 id="county-provider-heading" className="text-lg font-semibold text-text-primary">
          Local provider base
        </h2>
        <p className="text-sm text-text-secondary" role="note">
          Provider counts describe the licensed and active provider base. They are not available
          beds, vacancies, or guaranteed placement capacity.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Licensed providers"
            value={formatCount(county.licensedProviders)}
            icon={<Users className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Engaged local providers"
            value={formatCount(county.activeProviders)}
            helperText="Currently licensed with foster-home placement activity"
            icon={<Users className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Children per engaged provider"
            value={formatRatio(county.childrenPerActiveProvider)}
            helperText="Foster-home children divided by engaged local providers"
          />
          <MetricCard
            label="Inactive licensed providers"
            value={formatCount(county.inactiveProviders)}
            helperText="Licensed but without current foster-home placement"
          />
        </div>
      </section>

      <section aria-labelledby="county-pressure-heading" className="space-y-4">
        <h2 id="county-pressure-heading" className="text-lg font-semibold text-text-primary">
          Placement pressure and expiration exposure
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Out-of-county foster-home children"
            value={formatCount(county.outOfCountyFosterCount)}
            icon={<MapPin className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Out-of-county foster-home rate"
            value={formatNullablePercent(county.outOfCountyFosterRate)}
            helperText="Share of foster-home children placed outside the county"
          />
          <MetricCard
            label="Highest-pressure age group"
            value={county.highestPressureAgeGroup ?? "—"}
          />
          <MetricCard
            label="Licenses expiring within 90 days"
            value={formatCount(county.expiring90Days)}
            icon={<Clock className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Licenses expiring within 180 days"
            value={formatCount(county.expiring180Days)}
            icon={<Clock className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="High-priority outreach providers"
            value={formatCount(county.highRetentionProviders)}
            helperText="Providers with high retention outreach priority"
          />
          <MetricCard
            label="Medium-priority outreach providers"
            value={formatCount(county.mediumRetentionProviders)}
            helperText="Providers with medium retention outreach priority"
          />
        </div>
      </section>

      <section aria-labelledby="county-age-pressure-heading">
        <DataTableShell
          titleId="county-age-pressure-heading"
          title="Age-group recruitment comparison"
          description="Foster-home children and matching provider counts by age group. Engaged providers are licensed providers whose current preferences include the age group. Age unavailable is shown separately and does not receive an age-specific ratio."
        >
          {ageGroups.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-secondary" role="status">
              No age-group pressure metrics are available for this county.
            </p>
          ) : (
            <div className="data-table-viewport--scroll">
              <Table>
                <TableColgroup>
                  <TableCol style={{ width: "14%" }} />
                  <TableCol style={{ width: "12%" }} />
                  <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "14%" }} />
                  <TableCol style={{ width: "14%" }} />
                  <TableCol style={{ width: "14%" }} />
                  <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "16%" }} />
                  <TableCol className={tableColumnClasses.tabletHidden} style={{ width: "16%" }} />
                </TableColgroup>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead scope="col">Age group</TableHead>
                    <TableHead scope="col" className={tableColumnClasses.numeric}>
                      Foster-home children
                    </TableHead>
                    <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                      Matching licensed providers
                    </TableHead>
                    <TableHead scope="col" className={tableColumnClasses.numeric}>
                      Matching engaged providers
                    </TableHead>
                    <TableHead scope="col" className={tableColumnClasses.numeric}>
                      Children per matching engaged provider
                    </TableHead>
                    <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                      Statewide median
                    </TableHead>
                    <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                      Statewide 75th percentile
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
                      <TableRow key={group.ageGroup}>
                        <TableCell>{ageGroupSectionLabel(group.ageGroup)}</TableCell>
                        <TableCell className={tableColumnClasses.numeric}>
                          {formatCount(group.currentFosterHomeChildren)}
                        </TableCell>
                        <TableCell className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                          {formatCount(group.matchingLicensedProviders)}
                        </TableCell>
                        <TableCell className={tableColumnClasses.numeric}>
                          {formatCount(group.matchingActiveProviders)}
                        </TableCell>
                        <TableCell className={tableColumnClasses.numeric}>
                          {isUnknown ? "—" : formatRatio(group.childrenPerMatchingActiveProvider)}
                        </TableCell>
                        <TableCell className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                          {isUnknown || !benchmark ? "—" : formatRatio(benchmark.median)}
                        </TableCell>
                        <TableCell className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                          {isUnknown || !benchmark ? "—" : formatRatio(benchmark.p75)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DataTableShell>
      </section>

      <CountyRetentionTable
        county={county.county}
        providers={retentionProviders}
        pagination={retentionPagination}
      />

      <CountyLimitationsPanel limitations={limitations} />
    </div>
  );
}
