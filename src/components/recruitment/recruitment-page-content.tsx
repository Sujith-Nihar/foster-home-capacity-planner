import { Info } from "lucide-react";

import { AgeGroupPressureChart } from "@/components/charts/age-group-pressure-chart";
import { RecruitmentScatterChart } from "@/components/charts/recruitment-scatter-chart";
import { RecruitmentCountyTable } from "@/components/recruitment/recruitment-county-table";
import { RecruitmentFilters } from "@/components/recruitment/recruitment-filters";
import { RecruitmentPageHero } from "@/components/recruitment/recruitment-page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import type { AgeGroupPressureDto } from "@/lib/recruitment/analytics";
import { buildRecruitmentQueryString } from "@/lib/recruitment/query";
import type { CountyMetricsDto, FilterOptionsDto } from "@/lib/types/domain";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

type RecruitmentPageContentProps = {
  eligibleCounties: CountyMetricsDto[];
  limitedDataCounties: CountyMetricsDto[];
  filterOptions: FilterOptionsDto;
  ageGroupPressure: AgeGroupPressureDto[];
  searchParams: RecruitmentSearchParams;
};

export function RecruitmentPageContent({
  eligibleCounties,
  limitedDataCounties,
  filterOptions,
  ageGroupPressure,
  searchParams,
}: RecruitmentPageContentProps) {
  const exportQuery = buildRecruitmentQueryString(searchParams).replace(/^\?/, "");

  return (
    <div className="space-y-8">
      <RecruitmentPageHero eligibleCounties={eligibleCounties} />

      <div
        className="flex items-start gap-3 rounded-[1.125rem] border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-text-secondary"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        <p>
          Active local provider counts describe currently licensed providers with foster-home
          placement activity. They are not available beds, vacancies, or guaranteed placement
          capacity.
        </p>
      </div>

      <SectionShell tone="raised">
        <RecruitmentCountyTable
          counties={eligibleCounties}
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
      </SectionShell>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecruitmentScatterChart counties={eligibleCounties} />
        <AgeGroupPressureChart data={ageGroupPressure} />
      </div>

      <SectionShell>
        <RecruitmentCountyTable
          counties={limitedDataCounties}
          searchParams={searchParams}
          title="Limited-data counties"
          titleId="limited-data-counties-heading"
          description="Counties below minimum foster-home children or active-provider volume thresholds are shown separately and excluded from comparative scatter analysis."
          emptyMessage="No limited-data counties match the current filters."
          footer={`Showing ${limitedDataCounties.length} limited-data ${
            limitedDataCounties.length === 1 ? "county" : "counties"
          }.`}
        />
      </SectionShell>
    </div>
  );
}
