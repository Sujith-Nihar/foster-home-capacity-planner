import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DataTableFrameProps = {
  title?: string;
  titleId?: string;
  description?: string;
  toolbar?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function DataTableFrame({
  title,
  titleId,
  description,
  toolbar,
  filters,
  actions,
  children,
  footer,
  className,
}: DataTableFrameProps) {
  const hasHeader = Boolean(title || description || toolbar || filters || actions);

  return (
    <section className={cn("data-table-frame min-w-0 w-full", className)}>
      {hasHeader ? (
        <div className="space-y-3 border-b border-border-subtle px-4 py-4 sm:px-5 sm:py-4">
          {(title || description || actions) && (
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              {title || description ? (
                <div className="min-w-0 space-y-1">
                  {title ? (
                    <h2
                      id={titleId}
                      className="text-base font-medium tracking-tight text-text-primary sm:text-lg"
                    >
                      {title}
                    </h2>
                  ) : null}
                  {description ? (
                    <p className="text-sm text-text-secondary">{description}</p>
                  ) : null}
                </div>
              ) : null}
              {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
              ) : null}
            </div>
          )}
          {toolbar}
          {filters}
        </div>
      ) : null}
      <div className="data-table-viewport min-w-0">{children}</div>
      {footer ? (
        <div className="border-t border-border-subtle bg-surface-tint/30 px-4 py-3 text-sm text-text-secondary sm:px-5">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
