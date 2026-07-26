import { Suspense } from "react";
import { Info } from "lucide-react";

import { AgeGroupPressureChart } from "@/components/charts/age-group-pressure-chart";
import { RecruitmentScatterChart } from "@/components/charts/recruitment-scatter-chart";
import { MethodologyLink } from "@/components/methodology-link";
import { OperationalResultsFallback } from "@/components/operational/operational-results-fallback";
import { RecruitmentAdditionalAnalysisDisclosure } from "@/components/recruitment/recruitment-additional-analysis-disclosure";
import { RecruitmentCountyTable } from "@/components/recruitment/recruitment-county-table";
import { RecruitmentCountyResults } from "@/components/recruitment/recruitment-eligible-results";
import { RecruitmentFilters } from "@/components/recruitment/recruitment-filters";
import { PageIntroSpacing } from "@/components/layout/page-intro-spacing";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { RECRUITMENT_METRICS } from "@/content/methodology";
import { getCachedCountyAgeMetrics } from "@/lib/data/cached-snapshot";
import { deriveAgeGroupPressureFromCountyAgeMetrics } from "@/lib/data/cached-snapshot";
import { getRecruitmentCountiesForExport } from "@/lib/data/recruitment";
import { buildRecruitmentResultsKey } from "@/lib/filters/operational-results-key";
import { partitionRecruitmentCounties } from "@/lib/recruitment/analytics";
import { buildRecruitmentQueryString } from "@/lib/recruitment/query";
import type { FilterOptionsDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

type RecruitmentPageContentProps = {
  filterOptions: FilterOptionsDto;
  searchParams: RecruitmentSearchParams;
  rawSearchParams: Record<string, string | string[] | undefined>;
  highPriorityCount: number;
};

async function RecruitmentChartsSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [counties, allCountyAgeMetrics] = await Promise.all([
    getRecruitmentCountiesForExport(searchParams),
    getCachedCountyAgeMetrics(),
  ]);
  const { eligible } = partitionRecruitmentCounties(counties);
  const ageGroupPressure = deriveAgeGroupPressureFromCountyAgeMetrics(allCountyAgeMetrics);

  return (
    <div className="space-y-6">
      <AgeGroupPressureChart data={ageGroupPressure} />
      <RecruitmentAdditionalAnalysisDisclosure>
        <RecruitmentScatterChart counties={eligible} />
      </RecruitmentAdditionalAnalysisDisclosure>
    </div>
  );
}

export function RecruitmentPageContent({
  filterOptions,
  searchParams,
  rawSearchParams,
  highPriorityCount,
}: RecruitmentPageContentProps) {
  const exportQuery = buildRecruitmentQueryString(searchParams).replace(/^\?/, "");
  const resultsKey = buildRecruitmentResultsKey(searchParams);

  return (
    <PageIntroSpacing className="space-y-8">
      <PageIntroduction
        eyebrow="RECRUITMENT"
        headline="Focus recruitment where children and communities need it most."
        highlightPhrase="need it most"
        description="Compare children per engaged provider, out-of-county placement patterns and current age preferences across Illinois counties."
        aside={
          <div className="metric-card-surface p-5">
            <p className="eyebrow-label text-text-tertiary">Featured metric</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
              {formatCount(highPriorityCount)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Counties with high suggested recruitment attention
            </p>
          </div>
        }
      />

      <div
        className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-text-secondary"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        <p>{RECRUITMENT_METRICS.childrenPerEngagedProvider.limitation}</p>
      </div>

      <RecruitmentCountyTable
        header={
          <RecruitmentFilters
            filterOptions={filterOptions}
            searchParams={searchParams}
            exportQuery={exportQuery}
            title="County recruitment review"
            titleId="recruitment-county-table-heading"
            showResultCount={false}
          />
        }
      >
        <Suspense
          key={resultsKey}
          fallback={<OperationalResultsFallback rows={8} />}
        >
          <RecruitmentCountyResults searchParams={rawSearchParams} />
        </Suspense>
      </RecruitmentCountyTable>

      <Suspense
        key={`${resultsKey}-charts`}
        fallback={
          <div className="space-y-6" aria-busy="true">
            <div className="h-72 rounded-xl border border-border-default bg-muted/40" />
            <div className="h-40 rounded-xl border border-border-default bg-muted/40" />
          </div>
        }
      >
        <RecruitmentChartsSection searchParams={rawSearchParams} />
      </Suspense>

      <div className="flex justify-end">
        <MethodologyLink label="Review recruitment methodology" />
      </div>
    </PageIntroSpacing>
  );
}
