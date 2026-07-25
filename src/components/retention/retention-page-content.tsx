import { Suspense } from "react";

import { RetentionProviderTable } from "@/components/retention/retention-provider-table";
import { RetentionProviderListScrollManager } from "@/components/retention/retention-provider-list-scroll-manager";
import { ViewExpiringLicensesAction } from "@/components/retention/view-expiring-licenses-action";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { RETENTION_PROVIDER_LIST_ID } from "@/lib/retention/expiring-licenses";
import { RETENTION_METRICS } from "@/content/methodology";
import { buildRetentionQueryString } from "@/lib/retention/query";
import type { FilterOptionsDto, RetentionSummaryDto } from "@/lib/types/domain";
import type { RetentionSearchParams } from "@/lib/validation/search-params";
import { Info } from "lucide-react";

import {
  RetentionExpirationPanel,
  RetentionKpiGrid,
} from "@/components/retention/retention-kpi-grid";
import { MethodologyLink } from "@/components/methodology-link";

type RetentionPageContentProps = {
  filterOptions: FilterOptionsDto;
  summary: RetentionSummaryDto;
  searchParams: RetentionSearchParams;
  rawSearchParams: Record<string, string | string[] | undefined>;
};

export function RetentionPageContent({
  filterOptions,
  summary,
  searchParams,
  rawSearchParams,
}: RetentionPageContentProps) {
  const exportQuery = buildRetentionQueryString(searchParams).replace(/^\?/, "");

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <RetentionProviderListScrollManager />
      </Suspense>
      <PageIntroduction
        eyebrow="RETENTION"
        headline="Support the foster homes already serving Illinois families."
        highlightPhrase="support the foster homes"
        description="Identify licensed providers who may benefit from outreach based on recent placement activity and license timing."
        actionSlot={<ViewExpiringLicensesAction searchParams={searchParams} variant="primary" />}
      />

      <RetentionKpiGrid summary={summary} />

      <RetentionExpirationPanel summary={summary} searchParams={searchParams} />

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

      <section id={RETENTION_PROVIDER_LIST_ID} className="retention-provider-list scroll-mt-32">
        <RetentionProviderTable
          filterOptions={filterOptions}
          searchParams={searchParams}
          rawSearchParams={rawSearchParams}
          exportQuery={exportQuery}
        />
      </section>
    </div>
  );
}
