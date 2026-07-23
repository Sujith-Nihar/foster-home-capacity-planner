import { MethodologyLink } from "@/components/methodology-link";
import { PageHeader } from "@/components/page-header";
import { RecruitmentPageContent } from "@/components/recruitment/recruitment-page-content";
import { ReportingDateBadge } from "@/components/reporting-date-badge";
import { getRecruitmentPageData } from "@/lib/data/recruitment";
import { breadcrumbRecruitment } from "@/lib/navigation/breadcrumbs";

export const dynamic = "force-dynamic";

type RecruitmentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RecruitmentPage({ searchParams }: RecruitmentPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getRecruitmentPageData(resolvedSearchParams);

  return (
    <>
      <PageHeader
        title="Recruitment"
        description="County-level foster home recruitment planning priorities based on current placement pressure."
        breadcrumbs={breadcrumbRecruitment()}
        actions={<ReportingDateBadge reportingDate={data.filterOptions.reportingDate} />}
      />
      <RecruitmentPageContent
        eligibleCounties={data.eligibleCounties}
        limitedDataCounties={data.limitedDataCounties}
        filterOptions={data.filterOptions}
        ageGroupPressure={data.ageGroupPressure}
        searchParams={data.searchParams}
      />
      <div className="mt-8">
        <MethodologyLink label="Review recruitment methodology" />
      </div>
    </>
  );
}
