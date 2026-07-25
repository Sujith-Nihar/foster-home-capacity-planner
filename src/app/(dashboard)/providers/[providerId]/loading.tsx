import { MetricCardSkeleton, TableSkeleton } from "@/components/loading-skeleton";

export default function ProviderDetailLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite" aria-label="Loading provider detail" role="status">
      <h1 className="sr-only">Provider detail</h1>
      <div className="h-4 w-56 rounded-md bg-muted motion-safe:animate-pulse" aria-hidden="true" />
      <div className="space-y-3" aria-hidden="true">
        <div className="h-3 w-36 rounded-md bg-muted motion-safe:animate-pulse" />
        <div className="h-10 w-full max-w-md rounded-md bg-muted motion-safe:animate-pulse" />
        <div className="flex flex-wrap gap-3">
          <div className="h-8 w-28 rounded-full bg-muted motion-safe:animate-pulse" />
          <div className="h-8 w-36 rounded-full bg-muted motion-safe:animate-pulse" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-border-default bg-surface-raised p-4" aria-hidden="true">
        <div className="h-5 w-56 rounded-md bg-muted motion-safe:animate-pulse" />
        <TableSkeleton rows={4} />
      </div>
    </div>
  );
}
