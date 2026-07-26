import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageIntroSpacing } from "@/components/layout/page-intro-spacing";
import { MethodologyLink } from "@/components/methodology-link";
import { CountyDetailHeroAside } from "@/components/recruitment/county-detail-hero-aside";
import { CountyDetailPageContent } from "@/components/recruitment/county-detail-page-content";
import { CountyNotFound } from "@/components/recruitment/county-not-found";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { APP_NAME } from "@/config/navigation";
import { getCountyPageData } from "@/lib/data/counties";
import { breadcrumbCounty } from "@/lib/navigation/breadcrumbs";
import { normalizeRouteCounty } from "@/lib/navigation/counties";
import { setPerformanceRoute } from "@/lib/performance/timing";
import { buildCountyExecutiveSummary } from "@/lib/recruitment/county-detail";
import { isLimitedDataCounty } from "@/lib/recruitment/classification";
import { summarizeRecruitmentReason } from "@/lib/recruitment/reason-display";
import type { CountyMetricsDto } from "@/lib/types/domain";
import { formatCountyName } from "@/lib/utils/formatters";

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

function countyIntroDescription(county: CountyMetricsDto): string {
  return buildCountyExecutiveSummary(county);
}

function countyPrimaryReason(county: CountyMetricsDto): string | null {
  if (isLimitedDataCounty(county) || county.recruitmentReasons.length === 0) {
    return null;
  }

  return summarizeRecruitmentReason(county.recruitmentReasons[0]);
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
    <PageIntroSpacing>
      <Breadcrumbs items={breadcrumbCounty(displayName)} className="mb-6" />
      <PageIntroduction
        eyebrow="COUNTY BRIEFING"
        headline={displayName}
        description={countyIntroDescription(data.county)}
        aside={
          <CountyDetailHeroAside
            county={data.county}
            primaryReason={countyPrimaryReason(data.county)}
          />
        }
      />
      <CountyDetailPageContent data={data} />
      <div className="mt-8">
        <MethodologyLink label="Review recruitment methodology" />
      </div>
    </PageIntroSpacing>
  );
}
