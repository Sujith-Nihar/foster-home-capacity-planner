import { ListChecks } from "lucide-react";

import { cn } from "@/lib/utils";

type ReasonListProps = {
  title?: string;
  reasons: string[];
  emptyMessage?: string;
  className?: string;
};

export function ReasonList({
  title = "Contributing factors",
  reasons,
  emptyMessage = "No contributing factors recorded.",
  className,
}: ReasonListProps) {
  return (
    <section className={cn("space-y-2", className)} aria-labelledby="reason-list-heading">
      <h3
        id="reason-list-heading"
        className="flex items-center gap-2 text-sm font-medium text-text-primary"
      >
        <ListChecks className="size-4 text-text-tertiary" aria-hidden="true" />
        {title}
      </h3>
      {reasons.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-tertiary">{emptyMessage}</p>
      )}
    </section>
  );
}
