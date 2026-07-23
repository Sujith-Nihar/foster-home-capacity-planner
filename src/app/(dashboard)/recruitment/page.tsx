import { EmptyState } from "@/components/empty-state";
import { MethodologyLink } from "@/components/methodology-link";
import { PageHeader } from "@/components/page-header";
import { breadcrumbRecruitment } from "@/lib/navigation/breadcrumbs";

export default function RecruitmentPage() {
  return (
    <>
      <PageHeader
        title="Recruitment"
        description="County-level foster home recruitment planning priorities based on current placement pressure."
        breadcrumbs={breadcrumbRecruitment()}
      />
      <EmptyState
        title="Recruitment views coming next"
        description="County rankings, filters and drill-down detail will be added in a later phase."
        action={<MethodologyLink label="Review recruitment methodology" />}
      />
    </>
  );
}
