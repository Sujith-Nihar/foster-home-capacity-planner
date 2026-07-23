import { cn } from "@/lib/utils";

type LoadingSkeletonProps = {
  className?: string;
  rows?: number;
};

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-muted", className)} aria-hidden="true" />;
}

export function LoadingSkeleton({ className, rows = 3 }: LoadingSkeletonProps) {
  return (
    <div
      className={cn("space-y-4", className)}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading content"
    >
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-4 w-full max-w-xl" />
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonBlock key={index} className="h-4 w-full max-w-lg" />
      ))}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div
      className="space-y-3 rounded-xl border border-border-default bg-surface-raised p-4"
      aria-hidden="true"
    >
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-8 w-32" />
      <SkeletonBlock className="h-3 w-40" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-xl border border-border-default bg-surface-raised p-4" aria-hidden="true">
      <SkeletonBlock className="mb-4 h-8 w-full" />
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonBlock key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
