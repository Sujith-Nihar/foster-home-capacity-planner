import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { MethodologyLink } from "@/components/methodology-link";
import { OutreachPriorityBadge } from "@/components/retention/outreach-priority-badge";
import { ProviderDetailPageContent } from "@/components/providers/provider-detail-page-content";
import { ProviderNotFound } from "@/components/providers/provider-not-found";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { APP_NAME } from "@/config/navigation";
import { getProviderPageData } from "@/lib/data/providers";
import { breadcrumbProvider } from "@/lib/navigation/breadcrumbs";
import { parseProviderRouteId } from "@/lib/navigation/providers";
import { setPerformanceRoute } from "@/lib/performance/timing";
import { getPrimaryOutreachReasonForDisplay } from "@/lib/retention/reason-display";
import { formatProviderId } from "@/lib/utils/formatters";

export const dynamic = "force-dynamic";

type ProviderDetailPageProps = {
  params: Promise<{ providerId: string }>;
};

export async function generateMetadata({ params }: ProviderDetailPageProps): Promise<Metadata> {
  const { providerId } = await params;
  const normalizedProviderId = parseProviderRouteId(providerId);

  if (normalizedProviderId === null) {
    return {
      title: `Provider not found | ${APP_NAME}`,
    };
  }

  return {
    title: `Provider ${formatProviderId(normalizedProviderId)} | ${APP_NAME}`,
    description:
      "License status, engagement metrics, outreach priority reasons, and placement activity for a single licensed provider.",
  };
}

export default async function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  setPerformanceRoute("/providers/[providerId]");
  const { providerId } = await params;
  const data = await getProviderPageData(providerId);

  if (!data) {
    return <ProviderNotFound />;
  }

  const providerLabel = `Provider ${formatProviderId(data.provider.providerId)}`;
  const outreachReasonContext = {
    daysSinceLastPlacement: data.provider.daysSinceLastPlacement,
    daysUntilExpiration: data.provider.daysUntilExpiration,
    currentlyHasPlacement: data.provider.currentlyHasPlacement,
    engagementRateLast365: data.provider.engagementRateLast365,
    eligibleLicensedDaysLast365: data.provider.eligibleLicensedDaysLast365,
    activeDaysLast365: data.provider.activeDaysLast365,
  };
  const primaryOutreachReason = getPrimaryOutreachReasonForDisplay(
    data.provider.outreachReasons,
    outreachReasonContext,
  );

  return (
    <>
      <Breadcrumbs items={breadcrumbProvider(String(data.provider.providerId))} className="mb-6" />
      <PageIntroduction
        eyebrow="PROVIDER BRIEFING"
        headline={providerLabel}
        description="License status, recent activity, and outreach priority context for a single licensed provider."
        aside={
          <OutreachPriorityBadge
            priority={data.provider.outreachPriority}
            primaryReason={primaryOutreachReason}
          />
        }
      />
      <ProviderDetailPageContent data={data} />
      <div className="mt-8">
        <MethodologyLink label="Review retention methodology" />
      </div>
    </>
  );
}
