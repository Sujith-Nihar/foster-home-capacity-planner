import { OperationalResultCount } from "@/components/operational/operational-result-count";
import { RetentionPagination } from "@/components/retention/retention-pagination";
import { RetentionProviderTableContent } from "@/components/retention/retention-provider-table-content";
import { getRetentionProviders } from "@/lib/data/retention";
import { parseRetentionSearchParams } from "@/lib/validation/search-params";
import { formatCount } from "@/lib/utils/formatters";

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
  const startIndex =
    pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.totalCount);

  return (
    <>
      <div className="px-4 pt-2">
        <OperationalResultCount
          totalCount={pagination.totalCount}
          noun="provider"
          nounPlural="providers"
        />
      </div>

      {pagination.items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-text-secondary" role="status">
          {emptyProviderListMessage(params)}
        </p>
      ) : (
        <RetentionProviderTableContent providers={pagination.items} searchParams={params} />
      )}

      {pagination.totalCount > 0 ? (
        <div className="border-t border-border-subtle bg-surface-tint/30">
          <p className="border-b border-border-subtle px-4 py-2 text-sm text-text-secondary sm:px-5">
            Showing {formatCount(startIndex)}–{formatCount(endIndex)} of{" "}
            {formatCount(pagination.totalCount)} providers
          </p>
          <RetentionPagination
            searchParams={params}
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
          />
        </div>
      ) : null}
    </>
  );
}
