import { TableSkeleton } from "@/components/loading-skeleton";

type OperationalResultsFallbackProps = {
  rows?: number;
};

export function OperationalResultsFallback({ rows = 8 }: OperationalResultsFallbackProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-3 px-1 py-2">
      <TableSkeleton rows={rows} />
    </div>
  );
}
