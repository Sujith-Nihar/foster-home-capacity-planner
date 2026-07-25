import { Info } from "lucide-react";

import { MethodologyLink } from "@/components/methodology-link";
import {
  RetentionExpirationPanel,
  RetentionKpiGrid,
} from "@/components/retention/retention-kpi-grid";
import { RetentionProviderTable } from "@/components/retention/retention-provider-table";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { RETENTION_METRICS } from "@/content/methodology";
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
      <PageIntroduction
        eyebrow="RETENTION"
        headline="Support the foster homes already serving Illinois families."
        highlightPhrase="support the foster homes"
        description="Identify licensed providers who may benefit from outreach based on recent placement activity and license timing."
        actions={[{ label: "View expiring licenses", href: "/retention?expiration=within_90" }]}
      />

      <RetentionKpiGrid summary={summary} />

      <RetentionExpirationPanel summary={summary} />

      <div
        className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-text-secondary"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        <p>
          {RETENTION_METRICS.outreachPriority.explanation} {RETENTION_METRICS.outreachPriority.limitation}{" "}
          <MethodologyLink label="Read methodology" className="inline-flex align-baseline" />
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
