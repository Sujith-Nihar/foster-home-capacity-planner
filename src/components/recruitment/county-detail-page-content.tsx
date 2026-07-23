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
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import { ReasonList } from "@/components/reason-list";
import { DataTableShell } from "@/components/data-table-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CountyPageData } from "@/lib/data/counties";
import { ageGroupSectionLabel } from "@/lib/recruitment/county-detail";
import {
  formatCount,
  formatCountyName,
  formatNullablePercent,
  formatRatio,
  formatRecruitmentPriorityLabel,
} from "@/lib/utils/formatters";

type CountyDetailPageContentProps = {
  data: CountyPageData;
};

export function CountyDetailPageContent({ data }: CountyDetailPageContentProps) {
  const { county, ageGroups, retentionProviders, retentionPagination, priorityExplanation, limitations } =
    data;

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="county-summary-heading"
        className="section-enter overflow-hidden rounded-[var(--radius-hero)] border border-border-subtle bg-surface-raised p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="eyebrow-label text-text-tertiary">County executive summary</p>
            <h2 id="county-summary-heading" className="text-2xl font-medium tracking-tight text-text-primary">
              {formatCountyName(county.county)}
            </h2>
          </div>
          <PriorityBadge
            level={priorityToAttentionLevel(county.recruitmentPriority)}
            label={formatRecruitmentPriorityLabel(county.recruitmentPriority)}
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-text-secondary">{priorityExplanation}</p>
        {county.recruitmentReasons.length > 0 ? (
          <div className="mt-4">
            <ReasonList title="Readable priority reasons" reasons={county.recruitmentReasons} />
          </div>
        ) : null}
      </section>

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
            label="Active local providers"
            value={formatCount(county.activeProviders)}
            helperText="Currently licensed with foster-home placement activity"
            icon={<Users className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Children per active provider"
            value={formatRatio(county.childrenPerActiveProvider)}
            helperText="Foster-home children divided by active providers"
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
          title="Age-group pressure"
          description="Foster-home children and matching provider counts by age group. Unknown is shown separately from defined age bands."
        >
          {ageGroups.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-secondary" role="status">
              No age-group pressure metrics are available for this county.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Age group</TableHead>
                  <TableHead scope="col" className="text-right">
                    Foster-home children
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    Matching licensed providers
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    Matching active providers
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    Children per matching active provider
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ageGroups.map((group) => (
                  <TableRow key={group.ageGroup}>
                    <TableCell>{ageGroupSectionLabel(group.ageGroup)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCount(group.currentFosterHomeChildren)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCount(group.matchingLicensedProviders)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCount(group.matchingActiveProviders)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRatio(group.childrenPerMatchingActiveProvider)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
