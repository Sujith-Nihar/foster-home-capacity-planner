import { Suspense } from "react";

import { RetentionProviderTable } from "@/components/retention/retention-provider-table";
import { RetentionProviderListScrollManager } from "@/components/retention/retention-provider-list-scroll-manager";
import { ReviewHighPriorityProvidersAction } from "@/components/retention/review-high-priority-providers-action";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { RETENTION_PROVIDER_LIST_ID } from "@/lib/retention/expiring-licenses";
import { buildRetentionQueryString } from "@/lib/retention/query";
import type { FilterOptionsDto, RetentionSummaryDto } from "@/lib/types/domain";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

import {
  RetentionExpirationPanel,
  RetentionKpiGrid,
} from "@/components/retention/retention-kpi-grid";

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
        className="page-intro--retention"
        eyebrow="RETENTION"
        headline="Support the foster homes already serving Illinois families."
        highlightPhrase="support the foster homes"
        description="Identify licensed providers who may benefit from outreach based on recent placement activity and license timing."
        actionSlot={<ReviewHighPriorityProvidersAction />}
      />

      <RetentionKpiGrid summary={summary} />

      <RetentionExpirationPanel summary={summary} searchParams={searchParams} />

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
