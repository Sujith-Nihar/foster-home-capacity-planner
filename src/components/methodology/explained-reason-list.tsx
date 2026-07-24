import { ListChecks } from "lucide-react";

import type { ExplainedReason } from "@/lib/recruitment/reason-display";
import { cn } from "@/lib/utils";

type ExplainedReasonListProps = {
  title: string;
  reasons: ExplainedReason[];
  emptyMessage?: string;
  className?: string;
  headingLevel?: "h2" | "h3";
  headingId?: string;
  footer?: string;
};

export function ExplainedReasonList({
  title,
  reasons,
  emptyMessage = "No contributing factors recorded.",
  className,
  headingLevel = "h3",
  headingId = "explained-reason-list-heading",
  footer,
}: ExplainedReasonListProps) {
  const HeadingTag = headingLevel;

  return (
    <section className={cn("space-y-3", className)} aria-labelledby={headingId}>
      <HeadingTag
        id={headingId}
        className="flex items-center gap-2 text-sm font-medium text-text-primary"
      >
        <ListChecks className="size-4 text-text-tertiary" aria-hidden="true" />
        {title}
      </HeadingTag>
      {reasons.length > 0 ? (
        <ul className="space-y-3">
          {reasons.map((reason) => (
            <li key={`${reason.primary}-${reason.secondary ?? ""}`} className="space-y-1">
              <p className="text-sm text-text-primary">{reason.primary}</p>
              {reason.secondary ? (
                <p className="text-xs leading-5 text-text-secondary">{reason.secondary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-tertiary">{emptyMessage}</p>
      )}
      {footer ? <p className="text-xs leading-5 text-text-secondary">{footer}</p> : null}
    </section>
  );
}
