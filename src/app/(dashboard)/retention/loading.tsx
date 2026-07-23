import { MetricCardSkeleton, TableSkeleton } from "@/components/loading-skeleton";

export default function RetentionLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite" aria-label="Loading retention">
      <div className="h-16 rounded-lg border border-border-default bg-muted/40" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <TableSkeleton rows={10} />
    </div>
  );
}
