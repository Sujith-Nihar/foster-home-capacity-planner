import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type ActionPanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  icon?: ReactNode;
  className?: string;
  id?: string;
};

export function ActionPanel({
  eyebrow,
  title,
  description,
  action,
  icon,
  className,
  id,
}: ActionPanelProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={cn(
        "section-enter rounded-2xl border border-status-medium-border bg-attention-ivory p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <span className="mt-0.5 shrink-0 text-attention">{icon}</span> : null}
          <div className="min-w-0 space-y-2">
            {eyebrow ? <p className="eyebrow-label text-attention">{eyebrow}</p> : null}
            <h2
              id={id ? `${id}-title` : undefined}
              className="text-xl font-medium tracking-tight text-text-primary sm:text-2xl"
            >
              {title}
            </h2>
            {description ? (
              <p className="text-sm leading-6 text-text-secondary">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-status-medium-border bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
