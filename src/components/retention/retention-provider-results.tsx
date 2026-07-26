import { RetentionPagination } from "@/components/retention/retention-pagination";
import { RetentionProviderTableContent } from "@/components/retention/retention-provider-table-content";
import { getRetentionProviders } from "@/lib/data/retention";
import { buildRetentionResultCountMessage } from "@/lib/retention/result-count";
import { parseRetentionSearchParams } from "@/lib/validation/search-params";

type RetentionProviderResultsProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function emptyProviderListMessage(
  searchParams: ReturnType<typeof parseRetentionSearchParams>,
): string {
  if (searchParams.expiration !== "all") {
    return "No licensed providers have licenses ending within the selected period.";
  }

  return "No licensed providers match the selected filters.";
}

export async function RetentionProviderResults({ searchParams }: RetentionProviderResultsProps) {
  const params = parseRetentionSearchParams(searchParams);
  const pagination = await getRetentionProviders(searchParams);

  return (
    <>
      <p className="px-4 pt-2 text-sm text-text-secondary" role="status" aria-live="polite">
        {buildRetentionResultCountMessage(pagination.totalCount, params)}
      </p>

      {pagination.items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-text-secondary" role="status">
          {emptyProviderListMessage(params)}
        </p>
      ) : (
        <RetentionProviderTableContent providers={pagination.items} searchParams={params} />
      )}

      {pagination.totalCount > 0 ? (
        <RetentionPagination
          searchParams={params}
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
        />
      ) : null}
    </>
  );
}
