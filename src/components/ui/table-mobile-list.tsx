import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TableMobileListProps = {
  children: ReactNode;
  className?: string;
};

export function TableMobileList({ children, className }: TableMobileListProps) {
  return (
    <ul className={cn("table-mobile-only divide-y divide-border-subtle", className)}>
      {children}
    </ul>
  );
}

type TableMobileItemProps = {
  children: ReactNode;
  className?: string;
};

export function TableMobileItem({ children, className }: TableMobileItemProps) {
  return <li className={cn("px-4 py-4", className)}>{children}</li>;
}

type TableMobileFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function TableMobileField({ label, value, className }: TableMobileFieldProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 text-sm", className)}>
      <dt className="shrink-0 text-text-secondary">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-text-primary">{value}</dd>
    </div>
  );
}

type TableMobileDetailsProps = {
  summary: string;
  children: ReactNode;
};

export function TableMobileDetails({ summary, children }: TableMobileDetailsProps) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer font-medium text-brand-navy">{summary}</summary>
      <dl className="mt-2 space-y-2 border-t border-border-subtle pt-2">{children}</dl>
    </details>
  );
}
