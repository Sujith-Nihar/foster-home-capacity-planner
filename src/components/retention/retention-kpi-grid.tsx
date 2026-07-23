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
      <h2 id="retention-kpi-heading" className="text-lg font-semibold text-text-primary">
        Licensed provider snapshot
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Currently licensed providers"
          value={formatCount(summary.currentlyLicensedProviders)}
          helperText="Providers licensed beyond the reporting date"
          icon={<Users className="size-4" aria-hidden="true" />}
          href="/retention"
        />
        <MetricCard
          label="Currently active providers"
          value={formatCount(summary.currentlyActiveProviders)}
          helperText="Providers with a current foster-home placement"
          icon={<UserCheck className="size-4" aria-hidden="true" />}
          href="/retention?activity=active"
        />
        <MetricCard
          label="Inactive providers"
          value={formatCount(summary.inactiveProviders)}
          helperText="Licensed providers without a current placement"
          icon={<UserMinus className="size-4" aria-hidden="true" />}
          href="/retention?activity=inactive"
        />
        <MetricCard
          label="Licenses expiring within 90 days"
          value={formatCount(summary.licensesExpiringWithin90Days)}
          helperText="Providers with licenses ending soon"
          icon={<CalendarClock className="size-4" aria-hidden="true" />}
          href="/retention?expiration=within_90"
        />
        <MetricCard
          label="High outreach-priority providers"
          value={formatCount(summary.highOutreachPriorityProviders)}
          helperText="Providers classified as high outreach priority"
          icon={<ShieldAlert className="size-4" aria-hidden="true" />}
          href="/retention?priority=High"
        />
      </div>
    </section>
  );
}
