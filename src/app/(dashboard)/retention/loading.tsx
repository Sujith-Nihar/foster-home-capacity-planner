import { MetricCardSkeleton, TableSkeleton } from "@/components/loading-skeleton";

export default function RetentionLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite" aria-label="Loading retention" role="status">
      <div className="h-14 rounded-lg border border-border-default bg-muted/40" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <div className="h-24 rounded-lg border border-border-default bg-muted/40" aria-hidden="true" />
      <TableSkeleton rows={10} />
    </div>
  );
}
