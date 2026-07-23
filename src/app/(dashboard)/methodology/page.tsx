import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { breadcrumbMethodology } from "@/lib/navigation/breadcrumbs";

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        title="Methodology"
        description="Metric definitions, analytical assumptions and known limitations for this assessment build."
        breadcrumbs={breadcrumbMethodology()}
      />
      <EmptyState
        title="Documentation coming next"
        description="Detailed methodology content will be added in a later phase."
      />
    </>
  );
}
