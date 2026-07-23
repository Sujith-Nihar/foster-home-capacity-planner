import { ShieldAlert, UserCheck, UserMinus, Users } from "lucide-react";

import { BentoMetricCard } from "@/components/ui/bento-metric-card";
import type { RetentionSummaryDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type RetentionKpiGridProps = {
  summary: RetentionSummaryDto;
};

export function RetentionKpiGrid({ summary }: RetentionKpiGridProps) {
  return (
    <section aria-labelledby="retention-kpi-heading" className="space-y-5">
      <h2 id="retention-kpi-heading" className="sr-only">
        Retention key metrics
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BentoMetricCard
          label="Licensed providers"
          value={formatCount(summary.currentlyLicensedProviders)}
          helperText="Licensed beyond the reporting date"
          icon={<Users className="size-4" aria-hidden="true" />}
          href="/retention"
        />
        <BentoMetricCard
          label="Active providers"
          value={formatCount(summary.currentlyActiveProviders)}
          helperText="Current foster-home placement"
          icon={<UserCheck className="size-4" aria-hidden="true" />}
          href="/retention?activity=active"
          variant="positive"
        />
        <BentoMetricCard
          label="Inactive providers"
          value={formatCount(summary.inactiveProviders)}
          helperText="Licensed without current placement"
          icon={<UserMinus className="size-4" aria-hidden="true" />}
          href="/retention?activity=inactive"
          variant="amber"
        />
        <BentoMetricCard
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
