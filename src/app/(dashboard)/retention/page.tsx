import { MethodologyLink } from "@/components/methodology-link";
import { PageHeader } from "@/components/page-header";
import { ReportingDateBadge } from "@/components/reporting-date-badge";
import { RetentionPageContent } from "@/components/retention/retention-page-content";
import { getRetentionPageData } from "@/lib/data/retention";
import { breadcrumbRetention } from "@/lib/navigation/breadcrumbs";

export const dynamic = "force-dynamic";

type RetentionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RetentionPage({ searchParams }: RetentionPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getRetentionPageData(resolvedSearchParams);

  return (
    <>
      <PageHeader
        title="Retention"
        description="Licensed provider outreach priorities based on inactivity, engagement, and license expiration."
        breadcrumbs={breadcrumbRetention()}
        actions={<ReportingDateBadge reportingDate={data.filterOptions.reportingDate} />}
      />
      <RetentionPageContent
        providers={data.providers}
        filterOptions={data.filterOptions}
        summary={data.summary}
        searchParams={data.searchParams}
      />
      <div className="mt-8">
        <MethodologyLink label="Review retention methodology" />
      </div>
    </>
  );
}
