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
import { ExplainedReasonList } from "@/components/methodology/explained-reason-list";
import { MetricHelpTooltip } from "@/components/methodology/metric-help-tooltip";
import { DataTableShell } from "@/components/data-table-shell";
import { SectionReveal } from "@/components/ui/section-reveal";
import {
  BriefingSnapshotGrid,
  DecisionBriefingSection,
} from "@/components/ui/decision-briefing-section";
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
import { ageGroupSectionLabel, buildCountyExecutiveSummary } from "@/lib/recruitment/county-detail";
import { explainRecruitmentReason } from "@/lib/recruitment/reason-display";
import { MEASURABLE_AGE_GROUP_LABELS } from "@/lib/recruitment/age-groups";
import {
  COMPARABLE_COUNTIES,
  RECRUITMENT_INDICATORS_CAVEAT,
  RECRUITMENT_METRICS,
  TOP_25_PERCENT,
} from "@/content/methodology";
import {
  formatCount,
  formatNullablePercent,
  formatRatio,
} from "@/lib/utils/formatters";

type CountyDetailPageContentProps = {
  data: CountyPageData;
};

function countyBriefingLead(data: CountyPageData): string {
  return buildCountyExecutiveSummary(data.county);
}

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
      <SectionReveal>
        <DecisionBriefingSection
          titleId="county-snapshot-heading"
          title="County snapshot"
          lead={countyBriefingLead(data)}
        >
        <BriefingSnapshotGrid>
          <MetricCard
            label="Current foster-home children"
            value={formatCount(county.currentFosterHomeChildren)}
            helperText="Primary recruitment demand signal"
            icon={<Baby className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Engaged local providers"
            value={formatCount(county.activeProviders)}
            helperText="Licensed providers with foster-home placement activity"
            icon={<Users className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label={RECRUITMENT_METRICS.childrenPerEngagedProvider.label}
            value={formatRatio(county.childrenPerActiveProvider)}
            helperText={RECRUITMENT_METRICS.childrenPerEngagedProvider.interpretation}
          />
          <MetricCard
            label="Highest-pressure age group"
            value={county.highestPressureAgeGroup ?? "—"}
            helperText={RECRUITMENT_METRICS.ageGroupPressure.interpretation}
          />
          <MetricCard
            label={RECRUITMENT_METRICS.outOfCountyRate.label}
            value={formatNullablePercent(county.outOfCountyFosterRate)}
            helperText={RECRUITMENT_METRICS.outOfCountyRate.interpretation}
          />
          <MetricCard
            label="Suggested high outreach providers"
            value={formatCount(county.highRetentionProviders)}
            helperText="Providers with high suggested outreach priority"
          />
        </BriefingSnapshotGrid>
        </DecisionBriefingSection>
      </SectionReveal>

      <SectionReveal delayMs={40}>
        <section aria-labelledby="county-age-pressure-heading">
        <DataTableShell
          titleId="county-age-pressure-heading"
          title="Age-group recruitment comparison"
          description="Compare foster-home children and matching provider counts by age group. Review this before placement pressure and retention outreach."
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
                      Typical comparable county
                    </TableHead>
                    <TableHead scope="col" className={`${tableColumnClasses.numeric} ${tableColumnClasses.tabletHidden}`}>
                      <span className="inline-flex items-center gap-1">
                        Top 25% among comparable counties
                        <MetricHelpTooltip label="What does top 25% mean?">
                          {TOP_25_PERCENT.fullDefinition}
                        </MetricHelpTooltip>
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
      </SectionReveal>

      {county.recruitmentReasons.length > 0 ? (
        <DecisionBriefingSection
          titleId="county-priority-reasons-heading"
          title="Why this county warrants review"
          lead={RECRUITMENT_INDICATORS_CAVEAT}
          tone="raised"
        >
          <ExplainedReasonList
            title="Contributing indicators"
            reasons={county.recruitmentReasons.map((reason) => explainRecruitmentReason(reason))}
            headingLevel="h3"
            footer={`Comparison group: ${COMPARABLE_COUNTIES.comparisonGroupLabel}.`}
          />
        </DecisionBriefingSection>
      ) : null}

      <DecisionBriefingSection
        titleId="county-demand-heading"
        title="Current placement demand"
        lead="Foster-home, kin, and nonfamily placement counts at the reporting date."
      >
        <BriefingSnapshotGrid className="xl:grid-cols-2">
          <MetricCard
            label="Current kin placements"
            value={formatCount(county.currentKinChildren)}
            icon={<HeartHandshake className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Current nonfamily placements"
            value={formatCount(county.currentNonfamilyChildren)}
            icon={<Building2 className="size-4" aria-hidden="true" />}
          />
        </BriefingSnapshotGrid>
      </DecisionBriefingSection>

      <DecisionBriefingSection
        titleId="county-provider-heading"
        title="Local provider base"
        lead="Licensed and engaged provider counts describe the current provider base. They are not available beds, vacancies, or guaranteed placement capacity."
      >
        <BriefingSnapshotGrid className="xl:grid-cols-4">
          <MetricCard
            label="Licensed providers"
            value={formatCount(county.licensedProviders)}
            icon={<Users className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Engaged local providers"
            value={formatCount(county.activeProviders)}
          />
          <MetricCard
            label="Inactive licensed providers"
            value={formatCount(county.inactiveProviders)}
          />
          <MetricCard
            label="Children per engaged provider"
            value={formatRatio(county.childrenPerActiveProvider)}
          />
        </BriefingSnapshotGrid>
      </DecisionBriefingSection>

      <DecisionBriefingSection
        titleId="county-pressure-heading"
        title="Placement pressure and expiration exposure"
        lead="Out-of-county placement pressure, license timing, and retention outreach counts."
      >
        <BriefingSnapshotGrid className="xl:grid-cols-3">
          <MetricCard
            label="Out-of-county foster-home children"
            value={formatCount(county.outOfCountyFosterCount)}
            icon={<MapPin className="size-4" aria-hidden="true" />}
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
            label="Suggested high outreach providers"
            value={formatCount(county.highRetentionProviders)}
          />
          <MetricCard
            label="Suggested medium outreach providers"
            value={formatCount(county.mediumRetentionProviders)}
          />
        </BriefingSnapshotGrid>
      </DecisionBriefingSection>

      <CountyRetentionTable
        county={county.county}
        providers={retentionProviders}
        pagination={retentionPagination}
      />

      <CountyLimitationsPanel limitations={limitations} />
    </div>
  );
}
