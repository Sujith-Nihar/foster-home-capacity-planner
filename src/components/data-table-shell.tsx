import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DataTableShellProps = {
  title?: string;
  titleId?: string;
  description?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function DataTableShell({
  title,
  titleId,
  description,
  filters,
  actions,
  children,
  footer,
  className,
}: DataTableShellProps) {
  const hasHeader = Boolean(title || description || actions || filters);

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[1.125rem] border border-border-subtle bg-surface-raised shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-0",
        className,
      )}
    >
      {hasHeader ? (
        <CardHeader className="border-b border-border-subtle bg-surface-tint/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {title || description ? (
              <div className="space-y-1">
                {title ? (
                  <h2 id={titleId} className="text-lg font-medium tracking-tight text-text-primary">
                    {title}
                  </h2>
                ) : null}
                {description ? <CardDescription>{description}</CardDescription> : null}
              </div>
            ) : (
              <div />
            )}
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
          {filters ? (
            <div className="rounded-[1rem] border border-border-subtle bg-surface-raised p-4">
              {filters}
            </div>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent className="overflow-x-auto p-0">{children}</CardContent>
      {footer ? (
        <div className="border-t border-border-subtle bg-surface-tint/30 px-5 py-3 text-sm text-text-secondary">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
