import type { ReactNode } from "react";

import { DataTableShell } from "@/components/data-table-shell";

type RecruitmentCountyTableProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function RecruitmentCountyTable({
  header,
  footer,
  children,
}: RecruitmentCountyTableProps) {
  return (
    <DataTableShell header={header} footer={footer}>
      {children}
    </DataTableShell>
  );
}
