import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { MethodologyLink } from "@/components/methodology-link";
import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import { CountyDetailPageContent } from "@/components/recruitment/county-detail-page-content";
import { CountyNotFound } from "@/components/recruitment/county-not-found";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { APP_NAME } from "@/config/navigation";
import { getCountyPageData } from "@/lib/data/counties";
import { breadcrumbCounty } from "@/lib/navigation/breadcrumbs";
import { normalizeRouteCounty } from "@/lib/navigation/counties";
import { setPerformanceRoute } from "@/lib/performance/timing";
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
      title: `County not found | ${APP_NAME}`,
    };
  }

  const displayName = formatCountyName(normalizedCounty);

  return {
    title: `${displayName} recruitment | ${APP_NAME}`,
    description: `Recruitment planning context, age-group pressure, and retention outreach providers for ${displayName}.`,
  };
}

function countyIntroDescription(countyName: string, priority: string): string {
  if (priority === "Limited data") {
    return `${countyName} is tracked separately because it does not meet minimum volume thresholds for comparison among eligible counties.`;
  }

  return `${countyName} recruitment briefing with age-group indicators, provider base, and retention outreach context.`;
}

export default async function CountyDetailPage({
  params,
  searchParams,
}: CountyDetailPageProps) {
  setPerformanceRoute("/recruitment/[county]");
  const { county } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getCountyPageData(county, resolvedSearchParams);

  if (!data) {
    return <CountyNotFound />;
  }

  const displayName = formatCountyName(data.county.county);

  return (
    <>
      <Breadcrumbs items={breadcrumbCounty(displayName)} className="mb-6" />
      <PageIntroduction
        eyebrow="COUNTY BRIEFING"
        headline={displayName}
        description={countyIntroDescription(displayName, data.county.recruitmentPriority)}
        aside={
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
