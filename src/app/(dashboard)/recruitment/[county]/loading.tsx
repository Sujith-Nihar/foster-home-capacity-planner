import { TableSkeleton } from "@/components/loading-skeleton";

export default function CountyDetailLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite" aria-label="Loading county detail">
      <div className="h-40 rounded-lg border border-border-default bg-muted/40" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-28 rounded-xl border border-border-default bg-muted/40"
            aria-hidden="true"
          />
        ))}
      </div>
      <TableSkeleton rows={4} />
      <TableSkeleton rows={5} />
    </div>
  );
}
