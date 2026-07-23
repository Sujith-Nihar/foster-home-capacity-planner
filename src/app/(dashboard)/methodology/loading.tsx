import { MetricCardSkeleton } from "@/components/loading-skeleton";

export default function MethodologyLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite" aria-label="Loading methodology">
      <div className="h-16 rounded-lg border border-border-default bg-muted/40" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <div className="space-y-4" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-28 rounded-lg border border-border-default bg-muted/40" />
        ))}
      </div>
    </div>
  );
}
