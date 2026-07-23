import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DataTableShellProps = {
  title: string;
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
  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader className="border-b border-border-default">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h3 id={titleId} className="text-base font-medium text-text-primary">
              {title}
            </h3>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
        {filters ? <div className="pt-4">{filters}</div> : null}
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">{children}</CardContent>
      {footer ? (
        <div className="border-t border-border-default px-4 py-3 text-sm text-text-secondary">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
