import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StackedTableCellProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  secondaryClassName?: string;
  className?: string;
};

export function StackedTableCell({
  primary,
  secondary,
  secondaryClassName,
  className,
}: StackedTableCellProps) {
  return (
    <div className={cn("min-w-0 space-y-0.5", className)}>
      <div className="text-sm text-text-primary">{primary}</div>
      {secondary ? (
        <div className={cn("text-xs text-text-secondary", secondaryClassName)}>{secondary}</div>
      ) : null}
    </div>
  );
}
