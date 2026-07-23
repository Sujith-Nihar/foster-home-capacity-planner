import { Info } from "lucide-react";

import { RetentionKpiGrid } from "@/components/retention/retention-kpi-grid";
import { RetentionProviderTable } from "@/components/retention/retention-provider-table";
import { buildRetentionQueryString } from "@/lib/retention/query";
import type {
  FilterOptionsDto,
  PaginatedResult,
  ProviderMetricsDto,
  RetentionSummaryDto,
} from "@/lib/types/domain";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

type RetentionPageContentProps = {
  providers: PaginatedResult<ProviderMetricsDto>;
  filterOptions: FilterOptionsDto;
  summary: RetentionSummaryDto;
  searchParams: RetentionSearchParams;
};

export function RetentionPageContent({
  providers,
  filterOptions,
  summary,
  searchParams,
}: RetentionPageContentProps) {
  const exportQuery = buildRetentionQueryString(searchParams).replace(/^\?/, "");

  return (
    <div className="space-y-8">
      <RetentionKpiGrid summary={summary} />

      <div
        className="flex items-start gap-3 rounded-lg border border-border-default bg-surface-raised p-4 text-sm text-text-secondary"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        <p>
          Outreach priority is rule-based decision support for staff review. It highlights
          providers that may benefit from follow-up based on inactivity, engagement, and license
          timing. It is not a prediction of closure, non-renewal, or placement outcomes.
        </p>
      </div>

      <RetentionProviderTable
        providers={providers.items}
        pagination={providers}
        filterOptions={filterOptions}
        searchParams={searchParams}
        exportQuery={exportQuery}
      />
    </div>
  );
}
