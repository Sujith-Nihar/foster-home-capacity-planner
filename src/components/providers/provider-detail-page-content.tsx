import Link from "next/link";
import { Calendar, Clock, MapPin, UserCheck } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { ProviderActivityTimeline } from "@/components/providers/provider-activity-timeline";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import { ReasonList } from "@/components/reason-list";
import type { ProviderPageData } from "@/lib/types/domain";
import {
  formatAgePreferenceRange,
  formatBooleanLabel,
  formatCount,
  formatCountyName,
  formatNullablePercent,
  formatOutreachPriorityLabel,
  formatProviderId,
  formatReportingDate,
} from "@/lib/utils/formatters";

type ProviderDetailPageContentProps = {
  data: ProviderPageData;
};

export function ProviderDetailPageContent({ data }: ProviderDetailPageContentProps) {
  const { provider, activityPeriods, reviewSummary } = data;
  const countyHref = `/recruitment/${encodeURIComponent(provider.county)}`;

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="provider-summary-heading"
        className="section-enter overflow-hidden rounded-[var(--radius-hero)] border border-border-subtle bg-surface-raised p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="eyebrow-label text-text-tertiary">Provider executive summary</p>
            <h2 id="provider-summary-heading" className="text-2xl font-medium tracking-tight text-text-primary">
              Provider {formatProviderId(provider.providerId)}
            </h2>
            <p className="text-sm text-text-secondary">
              <MapPin className="mr-1 inline size-4 text-text-tertiary" aria-hidden="true" />
              County:{" "}
              <Link
                href={countyHref}
                className="font-medium text-accent-brand underline-offset-4 hover:underline"
              >
                {formatCountyName(provider.county)}
              </Link>
            </p>
          </div>
          <PriorityBadge
            level={priorityToAttentionLevel(provider.outreachPriority)}
            label={formatOutreachPriorityLabel(provider.outreachPriority)}
          />
        </div>
      </section>

      <section aria-labelledby="provider-license-heading" className="space-y-4">
        <h2 id="provider-license-heading" className="text-lg font-semibold text-text-primary">
          License and placement status
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="License start"
            value={formatReportingDate(provider.licenseStartDate)}
            helperText="Current license period start"
            icon={<Calendar className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="License end"
            value={formatReportingDate(provider.licenseEndDate)}
            helperText="Current license period end"
            icon={<Calendar className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Days until expiration"
            value={formatCount(provider.daysUntilExpiration)}
            helperText="Remaining days on the current license"
            icon={<Clock className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Current placement status"
            value={formatBooleanLabel(
              provider.currentlyHasPlacement,
              "Active",
              "Inactive",
            )}
            helperText="Whether the provider currently has a foster-home placement"
            icon={<UserCheck className="size-4" aria-hidden="true" />}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Preferred age range"
            value={formatAgePreferenceRange(provider.minAge, provider.maxAge)}
            helperText="Current licensed age preferences"
          />
          <MetricCard
            label="Days since last placement"
            value={
              provider.daysSinceLastPlacement === null
                ? "—"
                : formatCount(provider.daysSinceLastPlacement)
            }
            helperText={
              provider.lastCompletedPlacementEnd
                ? `Last completed placement ended ${formatReportingDate(provider.lastCompletedPlacementEnd)}`
                : "Not applicable while a placement is active or no completed placement is recorded"
            }
          />
        </div>
      </section>

      <section aria-labelledby="provider-engagement-heading" className="space-y-4">
        <h2 id="provider-engagement-heading" className="text-lg font-semibold text-text-primary">
          Engagement metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total active placement days"
            value={formatCount(provider.totalActiveDays)}
            helperText="Recorded foster-home placement activity"
          />
          <MetricCard
            label="Active days last 365"
            value={formatCount(provider.activeDaysLast365)}
            helperText="Placement-active days in the trailing year"
          />
          <MetricCard
            label="Eligible licensed days last 365"
            value={formatCount(provider.eligibleLicensedDaysLast365)}
            helperText="Licensed days used as the engagement denominator"
          />
          <MetricCard
            label="Engagement rate"
            value={formatNullablePercent(provider.engagementRateLast365)}
            helperText="Active days divided by eligible licensed days"
          />
        </div>
      </section>

      <section aria-labelledby="provider-outreach-heading" className="space-y-4">
        <h2 id="provider-outreach-heading" className="text-lg font-semibold text-text-primary">
          Outreach priority
        </h2>
        <ReasonList
          title="Triggered outreach reasons"
          reasons={provider.outreachReasons}
          emptyMessage="No elevated outreach signals at the reporting date."
        />
      </section>

      <ProviderActivityTimeline activityPeriods={activityPeriods} />

      <section
        aria-labelledby="provider-review-heading"
        className="rounded-lg border border-border-default bg-surface-raised p-6"
      >
        <h2 id="provider-review-heading" className="text-lg font-semibold text-text-primary">
          What staff may want to review
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary">{reviewSummary}</p>
      </section>

      <p className="text-sm text-text-secondary">
        <Link
          href={countyHref}
          className="font-medium text-accent-brand underline-offset-4 hover:underline"
        >
          View {formatCountyName(provider.county)} recruitment context
        </Link>
      </p>
    </div>
  );
}
