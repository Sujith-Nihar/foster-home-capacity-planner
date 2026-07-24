import type { ReactNode } from "react";

import { DataTableFrame } from "@/components/ui/data-table-frame";
import { cn } from "@/lib/utils";

type OperationalDataTableProps = {
  title?: string;
  titleId?: string;
  description?: string;
  toolbar?: ReactNode;
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
      actions={actions}
      footer={footer}
      className={cn(className)}
    >
      {children}
    </DataTableFrame>
  );
}
