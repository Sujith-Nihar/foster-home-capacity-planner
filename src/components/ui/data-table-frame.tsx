import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DataTableFrameProps = {
  title?: string;
  titleId?: string;
  description?: string;
  toolbar?: ReactNode;
  filters?: ReactNode;
  header?: ReactNode;
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
  header,
  actions,
  children,
  footer,
  className,
}: DataTableFrameProps) {
  const operationalHeader = header ?? filters ?? toolbar;
  const hasLegacyHeader = Boolean(title || description || actions);
  const hasHeader = Boolean(operationalHeader || hasLegacyHeader);

  return (
    <section className={cn("data-table-frame operational-data-surface min-w-0 w-full", className)}>
      {hasHeader ? (
        <>
          {operationalHeader}
          {!operationalHeader && hasLegacyHeader ? (
            <div className="operational-filter-panel">
              {(title || description || actions) && (
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  {title || description ? (
                    <div className="min-w-0">
                      {title ? (
                        <h2 id={titleId} className="operational-filter-panel__title">
                          {title}
                        </h2>
                      ) : null}
                      {description ? (
                        <p className="operational-filter-panel__description">{description}</p>
                      ) : null}
                    </div>
                  ) : null}
                  {actions ? (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
          <div className="operational-data-surface__divider" aria-hidden="true" />
        </>
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
