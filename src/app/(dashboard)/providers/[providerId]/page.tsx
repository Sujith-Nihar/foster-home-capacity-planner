import { EmptyState } from "@/components/empty-state";
import { MethodologyLink } from "@/components/methodology-link";
import { PageHeader } from "@/components/page-header";
import { breadcrumbProvider } from "@/lib/navigation/breadcrumbs";

type ProviderDetailPageProps = {
  params: Promise<{ providerId: string }>;
};

export default async function ProviderDetailPage({
  params,
}: ProviderDetailPageProps) {
  const { providerId } = await params;

  return (
    <>
      <PageHeader
        title={`Provider ${providerId}`}
        description="License status, recent activity and outreach priority context for a single licensed provider."
        breadcrumbs={breadcrumbProvider(providerId)}
      />
      <EmptyState
        title="Provider detail coming next"
        description="Activity periods, engagement metrics and outreach reasons will be added in a later phase."
        action={<MethodologyLink />}
      />
    </>
  );
}
