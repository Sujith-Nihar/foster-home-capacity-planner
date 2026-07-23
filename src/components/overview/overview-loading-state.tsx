import { MetricCardSkeleton } from "@/components/loading-skeleton";

export function OverviewLoadingState() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite" aria-label="Loading overview">
      <div className="space-y-4">
        <div className="h-6 w-40 rounded-md bg-muted" aria-hidden="true" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <MetricCardSkeleton key={index} />
          ))}
        </div>
      </div>
      <div className="h-48 rounded-xl border border-border-default bg-muted/40" aria-hidden="true" />
      <div className="h-64 rounded-xl border border-border-default bg-muted/40" aria-hidden="true" />
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-72 rounded-xl border border-border-default bg-muted/40"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
