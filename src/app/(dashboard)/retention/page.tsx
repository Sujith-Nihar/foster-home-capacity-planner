import { RetentionPageContent } from "@/components/retention/retention-page-content";
import { getRetentionPageData } from "@/lib/data/retention";

export const dynamic = "force-dynamic";

type RetentionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RetentionPage({ searchParams }: RetentionPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getRetentionPageData(resolvedSearchParams);

  return (
    <RetentionPageContent
      providers={data.providers}
      filterOptions={data.filterOptions}
      summary={data.summary}
      searchParams={data.searchParams}
    />
  );
}
