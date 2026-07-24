import type { Metadata } from "next";

import { MethodologyLink } from "@/components/methodology-link";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import { CountyDetailPageContent } from "@/components/recruitment/county-detail-page-content";
import { CountyNotFound } from "@/components/recruitment/county-not-found";
import { APP_TITLE } from "@/config/navigation";
import { getCountyPageData } from "@/lib/data/counties";
import { breadcrumbCounty } from "@/lib/navigation/breadcrumbs";
import { normalizeRouteCounty } from "@/lib/navigation/counties";
import { formatCountyName, formatRecruitmentPriorityLabel } from "@/lib/utils/formatters";

export const dynamic = "force-dynamic";

type CountyDetailPageProps = {
  params: Promise<{ county: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CountyDetailPageProps): Promise<Metadata> {
  const { county } = await params;
  const normalizedCounty = normalizeRouteCounty(county);

  if (!normalizedCounty) {
    return {
      title: `County not found | ${APP_TITLE}`,
    };
  }

  const displayName = formatCountyName(normalizedCounty);

  return {
    title: `${displayName} recruitment | ${APP_TITLE}`,
    description: `Recruitment planning context, age-group pressure, and retention outreach providers for ${displayName}.`,
  };
}

export default async function CountyDetailPage({
  params,
  searchParams,
}: CountyDetailPageProps) {
  const { county } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getCountyPageData(county, resolvedSearchParams);

  if (!data) {
    return <CountyNotFound />;
  }

  const displayName = formatCountyName(data.county.county);

  return (
    <>
      <PageHeader
        eyebrow="COUNTY BRIEFING"
        title={displayName}
        description={data.priorityExplanation}
        breadcrumbs={breadcrumbCounty(displayName)}
        status={
          <PriorityBadge
            level={priorityToAttentionLevel(data.county.recruitmentPriority)}
            label={formatRecruitmentPriorityLabel(data.county.recruitmentPriority)}
          />
        }
      />
      <CountyDetailPageContent data={data} />
      <div className="mt-8">
        <MethodologyLink label="Review recruitment methodology" />
      </div>
    </>
  );
}
