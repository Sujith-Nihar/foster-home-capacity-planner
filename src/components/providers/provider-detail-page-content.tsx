import Link from "next/link";
import { Calendar, Clock, MapPin, UserCheck } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { ProviderActivityTimeline } from "@/components/providers/provider-activity-timeline";
import { ReasonList } from "@/components/reason-list";
import {
  BriefingReviewPoints,
  splitBriefingSummary,
} from "@/components/ui/briefing-review-points";
import {
  BriefingSnapshotGrid,
  DecisionBriefingSection,
} from "@/components/ui/decision-briefing-section";
import type { ProviderPageData } from "@/lib/types/domain";
import {
  formatBooleanLabel,
  formatCount,
  formatCountyName,
  formatNullablePercent,
  formatReportingDate,
} from "@/lib/utils/formatters";

type ProviderDetailPageContentProps = {
  data: ProviderPageData;
};

export function ProviderDetailPageContent({ data }: ProviderDetailPageContentProps) {
  const { provider, activityPeriods, reviewSummary, currentPreferenceLabel, preferenceContext } =
    data;
  const countyHref = `/recruitment/${encodeURIComponent(provider.county)}`;

  return (
    <div className="space-y-8">
      <DecisionBriefingSection
        titleId="provider-snapshot-heading"
        title="Provider snapshot"
        lead={`Licensed provider in ${formatCountyName(provider.county)} at the reporting date.`}
      >
        <BriefingSnapshotGrid className="xl:grid-cols-4">
          <MetricCard
            label="Current placement status"
            value={formatBooleanLabel(
              provider.currentlyHasPlacement,
              "Currently active",
              "Inactive",
            )}
            icon={<UserCheck className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Days until expiration"
            value={formatCount(provider.daysUntilExpiration)}
            icon={<Clock className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Engagement rate"
            value={formatNullablePercent(provider.engagementRateLast365)}
            helperText="Active days divided by eligible licensed days"
          />
          <MetricCard
            label="County"
            value={
              <Link
                href={countyHref}
                className="font-medium text-brand-navy underline-offset-4 hover:underline"
              >
                {formatCountyName(provider.county)}
              </Link>
            }
            icon={<MapPin className="size-4" aria-hidden="true" />}
          />
        </BriefingSnapshotGrid>
      </DecisionBriefingSection>

      <DecisionBriefingSection
        titleId="provider-license-heading"
        title="License and placement status"
        lead="Current license period, placement activity, and licensed age preferences."
      >
        <BriefingSnapshotGrid className="xl:grid-cols-4">
          <MetricCard
            label="License start"
            value={formatReportingDate(provider.licenseStartDate)}
            icon={<Calendar className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="License end"
            value={formatReportingDate(provider.licenseEndDate)}
            icon={<Calendar className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="Current preference"
            value={currentPreferenceLabel}
            helperText={
              preferenceContext ?? "Current licensed age preferences for this provider"
            }
          />
          <MetricCard
            label="Days since last placement"
            value={
              provider.currentlyHasPlacement
                ? "—"
                : provider.daysSinceLastPlacement === null
                  ? "—"
                  : formatCount(provider.daysSinceLastPlacement)
            }
            helperText={
              provider.currentlyHasPlacement
                ? "Not shown while the provider is currently active"
                : provider.lastCompletedPlacementEnd
                  ? `Last completed placement ended ${formatReportingDate(provider.lastCompletedPlacementEnd)}`
                  : "No completed placement history is recorded"
            }
          />
        </BriefingSnapshotGrid>
      </DecisionBriefingSection>

      <DecisionBriefingSection
        titleId="provider-engagement-heading"
        title="Engagement metrics"
        lead="Placement activity during the trailing year and lifetime totals."
      >
        <BriefingSnapshotGrid className="xl:grid-cols-4">
          <MetricCard
            label="Total active placement days"
            value={formatCount(provider.totalActiveDays)}
          />
          <MetricCard
            label="Active days last 365"
            value={formatCount(provider.activeDaysLast365)}
          />
          <MetricCard
            label="Eligible licensed days last 365"
            value={formatCount(provider.eligibleLicensedDaysLast365)}
          />
          <MetricCard
            label="Engagement rate"
            value={formatNullablePercent(provider.engagementRateLast365)}
          />
        </BriefingSnapshotGrid>
      </DecisionBriefingSection>

      <DecisionBriefingSection
        titleId="provider-outreach-heading"
        title="Outreach priority"
        lead="Rule-based outreach signals for staff review. These do not predict provider closure."
        tone="raised"
      >
        <ReasonList
          title="Triggered outreach reasons"
          reasons={provider.outreachReasons}
          emptyMessage="No elevated outreach signals at the reporting date."
          headingLevel="h3"
        />
      </DecisionBriefingSection>

      <ProviderActivityTimeline activityPeriods={activityPeriods} />

      <BriefingReviewPoints
        titleId="provider-review-heading"
        title="What staff may want to review"
        points={splitBriefingSummary(reviewSummary).filter(
          (point) =>
            !point.startsWith("Outreach priority") && !point.startsWith("Triggered reasons"),
        )}
      />

      <p className="text-sm text-text-secondary">
        <Link
          href={countyHref}
          className="font-medium text-brand-navy underline-offset-4 hover:underline"
        >
          View {formatCountyName(provider.county)} recruitment context
        </Link>
      </p>
    </div>
  );
}
