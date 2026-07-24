import { MetricCardSkeleton, TableSkeleton } from "@/components/loading-skeleton";

export default function ProviderDetailLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite" aria-label="Loading provider detail" role="status">
      <h1 className="sr-only">Provider detail</h1>
      <div className="h-16 rounded-lg border border-border-default bg-muted/40" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <TableSkeleton rows={4} />
    </div>
  );
}
