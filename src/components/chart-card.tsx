import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[1.25rem] border border-border-subtle bg-surface-raised p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6",
        className,
      )}
    >
      <header className="mb-4 space-y-1">
        <h3 className="text-lg font-medium tracking-tight text-text-primary">{title}</h3>
        {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
      </header>
      <div>
        {children ?? (
          <div
            className="flex min-h-48 items-center justify-center rounded-[1rem] border border-dashed border-border-subtle bg-surface-tint px-4 text-sm text-text-tertiary"
            role="status"
          >
            Chart content will appear here.
          </div>
        )}
      </div>
    </article>
  );
}
