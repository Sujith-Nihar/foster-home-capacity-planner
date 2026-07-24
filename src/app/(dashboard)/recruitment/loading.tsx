import { TableSkeleton } from "@/components/loading-skeleton";

export default function RecruitmentLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite" aria-label="Loading recruitment" role="status">
      <div className="h-16 rounded-lg border border-border-default bg-muted/40" aria-hidden="true" />
      <TableSkeleton rows={8} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-xl border border-border-default bg-muted/40" aria-hidden="true" />
        <div className="h-72 rounded-xl border border-border-default bg-muted/40" aria-hidden="true" />
      </div>
      <TableSkeleton rows={4} />
    </div>
  );
}
