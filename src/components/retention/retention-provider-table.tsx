import { Suspense } from "react";

import { OperationalResultsFallback } from "@/components/operational/operational-results-fallback";
import { OperationalDataTable } from "@/components/ui/operational-data-table";
import { RetentionFilterToolbar } from "@/components/retention/retention-filter-toolbar";
import { RetentionProviderResults } from "@/components/retention/retention-provider-results";
import { buildRetentionResultsKey } from "@/lib/filters/operational-results-key";
import type { FilterOptionsDto } from "@/lib/types/domain";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

type RetentionProviderTableProps = {
  filterOptions: FilterOptionsDto;
  searchParams: RetentionSearchParams;
  rawSearchParams: Record<string, string | string[] | undefined>;
  exportQuery: string;
};

export function RetentionProviderTable({
  filterOptions,
  searchParams,
  rawSearchParams,
  exportQuery,
}: RetentionProviderTableProps) {
  return (
    <OperationalDataTable
      className="retention-data-table"
      header={
        <RetentionFilterToolbar
          filterOptions={filterOptions}
          searchParams={searchParams}
          exportQuery={exportQuery}
          title="Licensed provider outreach list"
          titleId="retention-provider-table-heading"
          showResultCount={false}
        />
      }
    >
      <Suspense
        key={buildRetentionResultsKey(searchParams)}
        fallback={
          <OperationalResultsFallback rows={10} />
        }
      >
        <RetentionProviderResults searchParams={rawSearchParams} />
      </Suspense>
    </OperationalDataTable>
  );
}
