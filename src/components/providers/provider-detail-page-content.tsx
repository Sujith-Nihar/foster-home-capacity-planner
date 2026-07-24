import Link from "next/link";
import { Calendar, Clock, MapPin, UserCheck } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { ProviderActivityTimeline } from "@/components/providers/provider-activity-timeline";
import { ProviderOutreachExplanation } from "@/components/providers/provider-outreach-explanation";
import {
  BriefingReviewPoints,
  splitBriefingSummary,
} from "@/components/ui/briefing-review-points";
import {
  BriefingSnapshotGrid,
  DecisionBriefingSection,
} from "@/components/ui/decision-briefing-section";
import { RETENTION_METRICS } from "@/content/methodology";
import type { ProviderPageData } from "@/lib/types/domain";
import { explainOutreachReason } from "@/lib/retention/reason-display";
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
  const outreachReasonContext = {
    daysSinceLastPlacement: provider.daysSinceLastPlacement,
    daysUntilExpiration: provider.daysUntilExpiration,
    currentlyHasPlacement: provider.currentlyHasPlacement,
    engagementRateLast365: provider.engagementRateLast365,
    eligibleLicensedDaysLast365: provider.eligibleLicensedDaysLast365,
    activeDaysLast365: provider.activeDaysLast365,
  };
  const explainedOutreachReasons = provider.outreachReasons.map((reason) =>
    explainOutreachReason(reason, outreachReasonContext),
  );

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
            label={RETENTION_METRICS.recentEngagement.label}
            value={formatNullablePercent(provider.engagementRateLast365)}
            helperText={RETENTION_METRICS.recentEngagement.interpretation}
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
            label={RETENTION_METRICS.daysSinceLastPlacement.label}
            value={
              provider.currentlyHasPlacement
                ? "Currently active"
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
        title="Recent placement activity"
        lead={`${RETENTION_METRICS.recentActiveDays.explanation} ${RETENTION_METRICS.recentEngagement.limitation}`}
      >
        <BriefingSnapshotGrid className="xl:grid-cols-4">
          <MetricCard
            label={RETENTION_METRICS.activePlacementDays.label}
            value={formatCount(provider.totalActiveDays)}
          />
          <MetricCard
            label={RETENTION_METRICS.recentActiveDays.label}
            value={formatCount(provider.activeDaysLast365)}
          />
          <MetricCard
            label={RETENTION_METRICS.eligibleLicensedDays.label}
            value={formatCount(provider.eligibleLicensedDaysLast365)}
          />
          <MetricCard
            label="Engagement rate"
            value={formatNullablePercent(provider.engagementRateLast365)}
          />
        </BriefingSnapshotGrid>
      </DecisionBriefingSection>

      <ProviderOutreachExplanation reasons={explainedOutreachReasons} />

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
