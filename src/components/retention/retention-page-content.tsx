import { Info } from "lucide-react";

import { MethodologyLink } from "@/components/methodology-link";
import { RetentionAttentionPanel } from "@/components/retention/retention-attention-panel";
import { RetentionKpiGrid } from "@/components/retention/retention-kpi-grid";
import { RetentionPageHero } from "@/components/retention/retention-page-hero";
import { RetentionProviderTable } from "@/components/retention/retention-provider-table";
import { SectionShell } from "@/components/ui/section-shell";
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
      <RetentionPageHero summary={summary} />

      <SectionShell tone="tint">
        <RetentionKpiGrid summary={summary} />
      </SectionShell>

      <RetentionAttentionPanel summary={summary} />

      <div
        className="flex items-start gap-3 rounded-[1.125rem] border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-text-secondary"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        <p>
          Outreach priorities are based on recent activity, engagement and license timing. They
          support staff review and do not predict provider closure.{" "}
          <MethodologyLink label="Read methodology" className="inline-flex align-baseline" />
        </p>
      </div>

      <SectionShell tone="raised">
        <RetentionProviderTable
          providers={providers.items}
          pagination={providers}
          filterOptions={filterOptions}
          searchParams={searchParams}
          exportQuery={exportQuery}
        />
      </SectionShell>
    </div>
  );
}
