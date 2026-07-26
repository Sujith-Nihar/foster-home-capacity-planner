import { CalendarClock, UserCheck, UserMinus, Users } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { ViewExpiringLicensesAction } from "@/components/retention/view-expiring-licenses-action";
import type { RetentionSummaryDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

type RetentionKpiGridProps = {
  summary: RetentionSummaryDto;
};

export function RetentionKpiGrid({ summary }: RetentionKpiGridProps) {
  return (
    <section aria-labelledby="retention-kpi-heading" className="space-y-4">
      <h2 id="retention-kpi-heading" className="sr-only">
        Statewide provider snapshot
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Licensed providers"
          value={formatCount(summary.currentlyLicensedProviders)}
          helperText="Licensed beyond the reporting date."
          icon={<Users className="size-4" aria-hidden="true" />}
          href="/retention"
        />
        <MetricCard
          label="Providers with a current placement"
          value={formatCount(summary.currentlyActiveProviders)}
          helperText="Have at least one current foster-home placement."
          icon={<UserCheck className="size-4" aria-hidden="true" />}
          href="/retention?activity=active"
          variant="positive"
        />
        <MetricCard
          label="Providers without a current placement"
          value={formatCount(summary.inactiveProviders)}
          helperText="Do not currently have a foster-home placement."
          icon={<UserMinus className="size-4" aria-hidden="true" />}
          href="/retention?activity=inactive"
          variant="amber"
        />
        <MetricCard
          label="High-priority outreach providers"
          value={formatCount(summary.highOutreachPriorityProviders)}
          helperText="Meet at least one High suggested outreach rule."
          icon={<Users className="size-4" aria-hidden="true" />}
          href="/retention?priority=High"
          variant="attention"
        />
      </div>
    </section>
  );
}

export function RetentionExpirationPanel({
  summary,
  searchParams,
}: RetentionKpiGridProps & { searchParams: RetentionSearchParams }) {
  const countLabel = formatCount(summary.licensesExpiringWithin90Days);

  return (
    <section
      aria-labelledby="retention-attention-heading"
      className="rounded-2xl border border-status-medium-border bg-attention-ivory p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <CalendarClock className="mt-1 size-5 shrink-0 text-attention" aria-hidden="true" />
          <div className="min-w-0 space-y-2">
            <p className="eyebrow-label text-attention">License exposure</p>
            <h2
              id="retention-attention-heading"
              className="text-xl font-medium tracking-tight text-text-primary sm:text-2xl"
            >
              {countLabel} licenses end within 90 days
            </h2>
            <p className="text-sm leading-6 text-text-secondary">
              Licensed providers with upcoming license end dates may warrant renewal follow-up.
            </p>
          </div>
        </div>
        <ViewExpiringLicensesAction searchParams={searchParams} variant="panel" />
      </div>
    </section>
  );
}
