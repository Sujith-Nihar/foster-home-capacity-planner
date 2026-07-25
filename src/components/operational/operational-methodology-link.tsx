import type { ReactNode } from "react";

type OperationalMethodologyLinkProps = {
  title: string;
  children: ReactNode;
};

export function OperationalMethodologyLink({
  title,
  children,
}: OperationalMethodologyLinkProps) {
  return (
    <details className="inline">
      <summary className="ml-1 inline cursor-pointer font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {title}
      </summary>
      <div className="mt-3 space-y-3 rounded-2xl border border-border-subtle bg-surface-raised p-4 text-sm leading-6 text-text-secondary">
        {children}
      </div>
    </details>
  );
}
