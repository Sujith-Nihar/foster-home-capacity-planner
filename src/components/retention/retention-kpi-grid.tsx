import Link from "next/link";
import { CalendarClock, ShieldAlert, UserCheck, UserMinus, Users } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import type { RetentionSummaryDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type RetentionKpiGridProps = {
  summary: RetentionSummaryDto;
};

export function RetentionKpiGrid({ summary }: RetentionKpiGridProps) {
  return (
    <section aria-labelledby="retention-kpi-heading" className="space-y-4">
      <h2 id="retention-kpi-heading" className="sr-only">
        Retention key metrics
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Licensed providers"
          value={formatCount(summary.currentlyLicensedProviders)}
          helperText="Licensed beyond the reporting date"
          icon={<Users className="size-4" aria-hidden="true" />}
          href="/retention"
        />
        <MetricCard
          label="Currently active"
          value={formatCount(summary.currentlyActiveProviders)}
          helperText="Current foster-home placement"
          icon={<UserCheck className="size-4" aria-hidden="true" />}
          href="/retention?activity=active"
          variant="positive"
        />
        <MetricCard
          label="Currently inactive"
          value={formatCount(summary.inactiveProviders)}
          helperText="Licensed without current placement"
          icon={<UserMinus className="size-4" aria-hidden="true" />}
          href="/retention?activity=inactive"
          variant="amber"
        />
        <MetricCard
          label="High outreach priority"
          value={formatCount(summary.highOutreachPriorityProviders)}
          helperText="Flagged for staff review"
          icon={<ShieldAlert className="size-4" aria-hidden="true" />}
          href="/retention?priority=High"
          variant="attention"
        />
      </div>
    </section>
  );
}

export function RetentionExpirationPanel({ summary }: RetentionKpiGridProps) {
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
              {countLabel} licenses expire within 90 days
            </h2>
            <p className="text-sm leading-6 text-text-secondary">
              Licensed providers with upcoming expiration dates may need renewal follow-up before
              capacity is affected.
            </p>
          </div>
        </div>
        <Link
          href="/retention?expiration=within_90"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-status-medium-border bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View expiring licenses
        </Link>
      </div>
    </section>
  );
}
