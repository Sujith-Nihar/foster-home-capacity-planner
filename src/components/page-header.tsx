import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
  eyebrow?: string;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  eyebrow,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "section-enter mb-8 overflow-hidden rounded-[var(--radius-hero)] border border-border-subtle bg-surface-raised p-6 sm:p-8",
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {eyebrow ? <p className="eyebrow-label text-text-tertiary">{eyebrow}</p> : null}
          <h1 className="text-3xl font-medium tracking-tight text-text-primary sm:text-4xl">{title}</h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-text-secondary sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
