import type { ReactNode } from "react";

import { DataTableShell } from "@/components/data-table-shell";
import { RecruitmentCountyTableBody } from "@/components/recruitment/recruitment-county-table-body";
import type { CountyAgeMetricsByCounty } from "@/lib/data/recruitment";
import type { CountyMetricsDto } from "@/lib/types/domain";
import type { RecruitmentSearchParams } from "@/lib/validation/search-params";

type RecruitmentCountyTableProps = {
  counties: CountyMetricsDto[];
  countyAgeMetricsByCounty: CountyAgeMetricsByCounty;
  searchParams: RecruitmentSearchParams;
  title: string;
  titleId: string;
  description: string;
  emptyMessage: string;
  filters?: ReactNode;
  footer?: ReactNode;
};

function toCountyAgeMetricsRecord(
  countyAgeMetricsByCounty: CountyAgeMetricsByCounty,
): Record<string, import("@/lib/types/domain").CountyAgeMetricsDto[]> {
  return Object.fromEntries(countyAgeMetricsByCounty.entries());
}

export function RecruitmentCountyTable({
  counties,
  countyAgeMetricsByCounty,
  searchParams,
  title,
  titleId,
  description,
  emptyMessage,
  filters,
  footer,
}: RecruitmentCountyTableProps) {
  const countyAgeMetricsRecord = toCountyAgeMetricsRecord(countyAgeMetricsByCounty);

  return (
    <DataTableShell
      title={title}
      titleId={titleId}
      description={description}
      filters={filters}
      footer={footer}
    >
      {counties.length === 0 ? (
        <p className="px-4 py-6 text-sm text-text-secondary" role="status">
          {emptyMessage}
        </p>
      ) : (
        <RecruitmentCountyTableBody
          counties={counties}
          countyAgeMetricsByCounty={countyAgeMetricsRecord}
          searchParams={searchParams}
        />
      )}
    </DataTableShell>
  );
}
