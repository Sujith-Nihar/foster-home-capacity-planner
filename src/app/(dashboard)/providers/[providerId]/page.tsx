import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageIntroSpacing } from "@/components/layout/page-intro-spacing";
import { MethodologyLink } from "@/components/methodology-link";
import { ProviderDetailHeader } from "@/components/providers/provider-detail-header";
import { ProviderDetailPageContent } from "@/components/providers/provider-detail-page-content";
import { ProviderNotFound } from "@/components/providers/provider-not-found";
import { APP_NAME } from "@/config/navigation";
import { getProviderPageData } from "@/lib/data/providers";
import { breadcrumbProvider } from "@/lib/navigation/breadcrumbs";
import { parseProviderRouteId } from "@/lib/navigation/providers";
import { setPerformanceRoute } from "@/lib/performance/timing";
import { getPrimaryOutreachReasonForDisplay } from "@/lib/retention/reason-display";
import { formatCountyName, formatProviderId } from "@/lib/utils/formatters";

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
      "Placement activity, license timing, outreach priority reasons, and review context for a single licensed provider.",
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
  const countyHref = `/recruitment/${encodeURIComponent(data.provider.county)}`;
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
    <PageIntroSpacing>
      <Breadcrumbs items={breadcrumbProvider(String(data.provider.providerId))} className="mb-4" />
      <ProviderDetailHeader
        provider={data.provider}
        providerLabel={providerLabel}
        countyHref={countyHref}
        countyLabel={formatCountyName(data.provider.county)}
        primaryOutreachReason={primaryOutreachReason}
        className="mb-6"
      />
      <ProviderDetailPageContent data={data} />
      <div className="mt-8">
        <MethodologyLink label="Review retention methodology" />
      </div>
    </PageIntroSpacing>
  );
}
