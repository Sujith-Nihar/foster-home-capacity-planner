import { MetricCardSkeleton, TableSkeleton } from "@/components/loading-skeleton";

export default function CountyDetailLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite" aria-label="Loading county detail" role="status">
      <div className="h-4 w-56 rounded-md bg-muted motion-safe:animate-pulse" aria-hidden="true" />
      <div className="space-y-3" aria-hidden="true">
        <div className="h-3 w-32 rounded-md bg-muted motion-safe:animate-pulse" />
        <div className="h-10 w-full max-w-xl rounded-md bg-muted motion-safe:animate-pulse" />
        <div className="h-4 w-full max-w-2xl rounded-md bg-muted motion-safe:animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-border-default bg-surface-raised p-4" aria-hidden="true">
        <div className="h-5 w-48 rounded-md bg-muted motion-safe:animate-pulse" />
        <TableSkeleton rows={4} />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
