import { EmptyState } from "@/components/empty-state";
import { MethodologyLink } from "@/components/methodology-link";
import { PageHeader } from "@/components/page-header";
import { breadcrumbRetention } from "@/lib/navigation/breadcrumbs";

export default function RetentionPage() {
  return (
    <>
      <PageHeader
        title="Retention"
        description="Licensed provider outreach priorities based on inactivity, engagement and license expiration."
        breadcrumbs={breadcrumbRetention()}
      />
      <EmptyState
        title="Retention views coming next"
        description="Filterable provider lists, priority badges and export tools will be added in a later phase."
        action={<MethodologyLink label="Review retention methodology" />}
      />
    </>
  );
}
