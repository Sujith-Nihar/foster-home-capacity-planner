import type { Metadata } from "next";

import { MethodologyLink } from "@/components/methodology-link";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import { ProviderDetailPageContent } from "@/components/providers/provider-detail-page-content";
import { ProviderNotFound } from "@/components/providers/provider-not-found";
import { APP_TITLE } from "@/config/navigation";
import { getProviderPageData } from "@/lib/data/providers";
import { breadcrumbProvider } from "@/lib/navigation/breadcrumbs";
import { parseProviderRouteId } from "@/lib/navigation/providers";
import { formatOutreachPriorityLabel, formatProviderId } from "@/lib/utils/formatters";

export const dynamic = "force-dynamic";

type ProviderDetailPageProps = {
  params: Promise<{ providerId: string }>;
};

export async function generateMetadata({ params }: ProviderDetailPageProps): Promise<Metadata> {
  const { providerId } = await params;
  const normalizedProviderId = parseProviderRouteId(providerId);

  if (normalizedProviderId === null) {
    return {
      title: `Provider not found | ${APP_TITLE}`,
    };
  }

  return {
    title: `Provider ${formatProviderId(normalizedProviderId)} | ${APP_TITLE}`,
    description:
      "License status, engagement metrics, outreach priority reasons, and placement activity for a single licensed provider.",
  };
}

export default async function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  const { providerId } = await params;
  const data = await getProviderPageData(providerId);

  if (!data) {
    return <ProviderNotFound />;
  }

  return (
    <>
      <PageHeader
        eyebrow="PROVIDER BRIEFING"
        title={`Provider ${formatProviderId(data.provider.providerId)}`}
        description="License status, recent activity, and outreach priority context for a single licensed provider."
        breadcrumbs={breadcrumbProvider(String(data.provider.providerId))}
        status={
          <PriorityBadge
            level={priorityToAttentionLevel(data.provider.outreachPriority)}
            label={formatOutreachPriorityLabel(data.provider.outreachPriority)}
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
