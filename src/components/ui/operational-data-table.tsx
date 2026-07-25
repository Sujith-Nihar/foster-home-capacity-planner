import type { ReactNode } from "react";

import { DataTableFrame } from "@/components/ui/data-table-frame";
import { cn } from "@/lib/utils";

type OperationalDataTableProps = {
  title?: string;
  titleId?: string;
  description?: string;
  toolbar?: ReactNode;
  header?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function OperationalDataTable({
  title,
  titleId,
  description,
  toolbar,
  header,
  actions,
  children,
  footer,
  className,
}: OperationalDataTableProps) {
  return (
    <DataTableFrame
      title={title}
      titleId={titleId}
      description={description}
      toolbar={toolbar}
      header={header}
      actions={actions}
      footer={footer}
      className={cn(className)}
    >
      {children}
    </DataTableFrame>
  );
}
