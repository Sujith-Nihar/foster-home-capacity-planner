import { EmptyState } from "@/components/empty-state";
import { MethodologyLink } from "@/components/methodology-link";
import { PageHeader } from "@/components/page-header";
import { formatCountyName } from "@/lib/utils/formatters";
import { breadcrumbCounty } from "@/lib/navigation/breadcrumbs";

type CountyDetailPageProps = {
  params: Promise<{ county: string }>;
};

export default async function CountyDetailPage({ params }: CountyDetailPageProps) {
  const { county } = await params;
  const countyName = decodeURIComponent(county);
  const displayName = formatCountyName(countyName);

  return (
    <>
      <PageHeader
        title={displayName}
        description="County recruitment context, age-group pressure and linked retention providers."
        breadcrumbs={breadcrumbCounty(displayName)}
      />
      <EmptyState
        title="County detail coming next"
        description={`Recruitment and retention views for ${displayName} will be added in a later phase.`}
        action={<MethodologyLink />}
      />
    </>
  );
}
