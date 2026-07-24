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
  status?: ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  eyebrow,
  status,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "section-enter mb-8 border-b border-border-subtle pb-6",
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          {eyebrow ? <p className="eyebrow-label">{eyebrow}</p> : null}
          <h1 className="max-w-3xl text-2xl font-medium tracking-tight text-text-primary sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          {status}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
