import type { ReactNode } from "react";

import { DataTableFrame } from "@/components/ui/data-table-frame";
import { cn } from "@/lib/utils";

type DataTableShellProps = {
  title?: string;
  titleId?: string;
  description?: string;
  filters?: ReactNode;
  header?: ReactNode;
  toolbar?: ReactNode;
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
  header,
  toolbar,
  actions,
  children,
  footer,
  className,
}: DataTableShellProps) {
  return (
    <DataTableFrame
      title={title}
      titleId={titleId}
      description={description}
      filters={filters}
      header={header}
      toolbar={toolbar}
      actions={actions}
      footer={footer}
      className={cn(className)}
    >
      {children}
    </DataTableFrame>
  );
}
