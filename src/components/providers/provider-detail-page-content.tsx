import { ProviderActivityTimeline } from "@/components/providers/provider-activity-timeline";
import { ProviderCountyContext } from "@/components/providers/provider-county-context";
import { ProviderKeyRetentionMetrics } from "@/components/providers/provider-key-retention-metrics";
import { ProviderLicensePreferences } from "@/components/providers/provider-license-preferences";
import { ProviderOutreachExplanation } from "@/components/providers/provider-outreach-explanation";
import { ProviderRecentPlacementActivity } from "@/components/providers/provider-recent-placement-activity";
import { ProviderStaffFollowUp } from "@/components/providers/provider-staff-follow-up";
import { SectionReveal } from "@/components/ui/section-reveal";
import type { ProviderPageData } from "@/lib/types/domain";

type ProviderDetailPageContentProps = {
  data: ProviderPageData;
};

export function ProviderDetailPageContent({ data }: ProviderDetailPageContentProps) {
  const {
    provider,
    activityPeriods,
    preferredAgeRangeLabel,
    ageGroupOverlapNote,
    countyRecruitmentOverlapSentence,
  } = data;

  return (
    <div className="provider-detail-content space-y-8">
      <ProviderKeyRetentionMetrics provider={provider} />

      <ProviderOutreachExplanation provider={provider} />

      <SectionReveal>
        <ProviderLicensePreferences
          provider={provider}
          preferredAgeRangeLabel={preferredAgeRangeLabel}
          ageGroupOverlapNote={ageGroupOverlapNote}
        />
      </SectionReveal>

      <SectionReveal delayMs={40}>
        <ProviderRecentPlacementActivity provider={provider} />
      </SectionReveal>

      <SectionReveal delayMs={60}>
        <ProviderActivityTimeline provider={provider} activityPeriods={activityPeriods} />
      </SectionReveal>

      <ProviderStaffFollowUp
        provider={provider}
        preferredAgeRangeLabel={preferredAgeRangeLabel}
      />

      <ProviderCountyContext
        county={provider.county}
        countyRecruitmentOverlapSentence={countyRecruitmentOverlapSentence}
      />
    </div>
  );
}
