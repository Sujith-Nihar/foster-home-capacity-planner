import { PageHeader } from "@/components/page-header";
import { MethodologyPageContent } from "@/components/methodology/methodology-page-content";
import { ReportingDateBadge } from "@/components/reporting-date-badge";
import { getMethodologyPageData } from "@/lib/data/methodology";
import { breadcrumbMethodology } from "@/lib/navigation/breadcrumbs";

export const dynamic = "force-dynamic";

export default async function MethodologyPage() {
  const data = await getMethodologyPageData();

  return (
    <>
      <PageHeader
        title="Methodology"
        description="Metric definitions, analytical assumptions, and known limitations for this assessment build."
        breadcrumbs={breadcrumbMethodology()}
        actions={<ReportingDateBadge reportingDate={data.metadata.reportingDate} />}
      />
      <MethodologyPageContent metadata={data.metadata} sections={data.sections} />
    </>
  );
}
