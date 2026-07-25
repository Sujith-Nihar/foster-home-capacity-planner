import { CalendarClock } from "lucide-react";

import { ViewExpiringLicensesAction } from "@/components/retention/view-expiring-licenses-action";
import { SectionShell } from "@/components/ui/section-shell";
import type { RetentionSummaryDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

type RetentionAttentionPanelProps = {
  summary: RetentionSummaryDto;
  searchParams: RetentionSearchParams;
};

export function RetentionAttentionPanel({ summary, searchParams }: RetentionAttentionPanelProps) {
  const countLabel = formatCount(summary.licensesExpiringWithin90Days);

  return (
    <SectionShell tone="attention" aria-labelledby="retention-attention-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <CalendarClock
            className="mt-1 size-5 shrink-0 text-status-medium"
            aria-hidden="true"
          />
          <div className="min-w-0 space-y-2">
            <p className="eyebrow-label text-status-medium">License exposure</p>
            <h2
              id="retention-attention-heading"
              className="text-xl font-medium tracking-tight text-text-primary sm:text-2xl"
            >
              {countLabel} licenses expire within 90 days
            </h2>
            <p className="text-sm leading-6 text-text-secondary">
              Licensed providers with upcoming expiration dates may need renewal follow-up before
              capacity is affected.
            </p>
          </div>
        </div>
        <ViewExpiringLicensesAction searchParams={searchParams} variant="panel" />
      </div>
    </SectionShell>
  );
}
