import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 rounded-lg border border-border-default bg-surface-raised p-6",
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Inbox className="mt-0.5 size-5 shrink-0 text-text-tertiary" aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <p className="max-w-prose text-sm text-text-secondary">{description}</p>
        </div>
      </div>
      {action ? <div className="pl-8">{action}</div> : null}
    </div>
  );
}
