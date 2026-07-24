import { Info } from "lucide-react";

import { AgeGroupPressureChart } from "@/components/charts/age-group-pressure-chart";
import { RecruitmentScatterChart } from "@/components/charts/recruitment-scatter-chart";
import { MethodologyLink } from "@/components/methodology-link";
import { RecruitmentCountyTable } from "@/components/recruitment/recruitment-county-table";
import { RecruitmentFilters } from "@/components/recruitment/recruitment-filters";
import { PageIntroduction } from "@/components/ui/page-introduction";
import type { CountyAgeMetricsByCounty } from "@/lib/data/recruitment";
import type { AgeGroupPressureDto } from "@/lib/recruitment/analytics";
import { buildRecruitmentQueryString } from "@/lib/recruitment/query";
import type { CountyMetricsDto, FilterOptionsDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

type RecruitmentPageContentProps = {
  eligibleCounties: CountyMetricsDto[];
  limitedDataCounties: CountyMetricsDto[];
  filterOptions: FilterOptionsDto;
  ageGroupPressure: AgeGroupPressureDto[];
  countyAgeMetricsByCounty: CountyAgeMetricsByCounty;
  searchParams: RecruitmentSearchParams;
};

export function RecruitmentPageContent({
  eligibleCounties,
  limitedDataCounties,
  filterOptions,
  ageGroupPressure,
  countyAgeMetricsByCounty,
  searchParams,
}: RecruitmentPageContentProps) {
  const exportQuery = buildRecruitmentQueryString(searchParams).replace(/^\?/, "");
  const highPriorityCount = eligibleCounties.filter(
    (county) => county.recruitmentPriority === "High",
  ).length;

  return (
    <div className="space-y-8">
      <PageIntroduction
        title="Recruitment"
        eyebrow="RECRUITMENT"
        headline="Focus recruitment where children and communities need it most."
        highlightPhrase="need it most"
        description="County-level foster home recruitment planning priorities based on current placement pressure."
        aside={
          <div className="metric-card-surface p-5">
            <p className="eyebrow-label text-text-tertiary">Featured metric</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
              {formatCount(highPriorityCount)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">High-priority recruitment counties</p>
          </div>
        }
      />

      <div
        className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-text-secondary"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        <p>
          Active local provider counts describe currently licensed providers with foster-home
          placement activity. They are not available beds, vacancies, or guaranteed placement
          capacity.
        </p>
      </div>

      <RecruitmentCountyTable
        counties={eligibleCounties}
        countyAgeMetricsByCounty={countyAgeMetricsByCounty}
        searchParams={searchParams}
        title="County recruitment planning priorities"
        titleId="recruitment-county-table-heading"
        description="Eligible counties meeting minimum volume rules for comparative recruitment planning priority."
        emptyMessage="No eligible counties match the current filters."
        filters={
          <RecruitmentFilters
            filterOptions={filterOptions}
            searchParams={searchParams}
            exportQuery={exportQuery}
          />
        }
        footer={`Showing ${eligibleCounties.length} eligible ${
          eligibleCounties.length === 1 ? "county" : "counties"
        }.`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecruitmentScatterChart counties={eligibleCounties} />
        <AgeGroupPressureChart data={ageGroupPressure} />
      </div>

      <RecruitmentCountyTable
        counties={limitedDataCounties}
        countyAgeMetricsByCounty={countyAgeMetricsByCounty}
        searchParams={searchParams}
        title="Limited-data counties"
        titleId="limited-data-counties-heading"
        description="Counties below minimum foster-home children or active-provider volume thresholds are shown separately and excluded from comparative scatter analysis."
        emptyMessage="No limited-data counties match the current filters."
        footer={`Showing ${limitedDataCounties.length} limited-data ${
          limitedDataCounties.length === 1 ? "county" : "counties"
        }.`}
      />

      <div className="flex justify-end">
        <MethodologyLink label="Review recruitment methodology" />
      </div>
    </div>
  );
}
