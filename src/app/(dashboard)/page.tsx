import { MethodologyLink } from "@/components/methodology-link";
import { OverviewPageContent } from "@/components/overview/overview-page-content";
import { PageHeader } from "@/components/page-header";
import { ReportingDateBadge } from "@/components/reporting-date-badge";
import { getOverviewPageData } from "@/lib/data/overview";
import { breadcrumbOverview } from "@/lib/navigation/breadcrumbs";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getOverviewPageData();

  return (
    <>
      <PageHeader
        title="Overview"
        description="Statewide foster home capacity snapshot and areas that may warrant staff review."
        breadcrumbs={breadcrumbOverview()}
        actions={<ReportingDateBadge reportingDate={data.snapshot.reportingDate} />}
      />
      <OverviewPageContent
        snapshot={data.snapshot}
        insights={data.insights}
        topRecruitmentCounties={data.topRecruitmentCounties}
        monthlyMetrics={data.monthlyMetrics}
        retentionDistribution={data.retentionDistribution}
        largestCounties={data.largestCounties}
      />
      <div className="mt-8">
        <MethodologyLink />
      </div>
    </>
  );
}
