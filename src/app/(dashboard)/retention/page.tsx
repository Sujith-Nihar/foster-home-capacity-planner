import { RetentionPageContent } from "@/components/retention/retention-page-content";
import { getCachedFilterOptions, getCachedRetentionSummaryMetrics } from "@/lib/data/cached-snapshot";
import { parseRetentionSearchParams } from "@/lib/validation/search-params";
import { setPerformanceRoute } from "@/lib/performance/timing";

export const dynamic = "force-dynamic";

type RetentionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RetentionPage({ searchParams }: RetentionPageProps) {
  setPerformanceRoute("/retention");
  const resolvedSearchParams = await searchParams;
  const [filterOptions, summary] = await Promise.all([
    getCachedFilterOptions(),
    getCachedRetentionSummaryMetrics(),
  ]);

  return (
    <RetentionPageContent
      filterOptions={filterOptions}
      summary={summary}
      searchParams={parseRetentionSearchParams(resolvedSearchParams)}
      rawSearchParams={resolvedSearchParams}
    />
  );
}
