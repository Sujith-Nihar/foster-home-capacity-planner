import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DecisionBriefingSectionProps = {
  title: string;
  titleId: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "raised" | "attention";
};

const toneClasses = {
  default: "",
  raised: "rounded-2xl border border-border-subtle bg-surface-raised p-5 sm:p-6",
  attention: "rounded-2xl border border-status-medium-border bg-attention-ivory p-5 sm:p-6",
} as const;

export function DecisionBriefingSection({
  title,
  titleId,
  lead,
  children,
  className,
  tone = "default",
}: DecisionBriefingSectionProps) {
  return (
    <section aria-labelledby={titleId} className={cn(toneClasses[tone], className)}>
      <div className="space-y-1">
        <h2 id={titleId} className="text-lg font-semibold text-text-primary">
          {title}
        </h2>
        {lead ? <p className="max-w-3xl text-sm leading-6 text-text-secondary">{lead}</p> : null}
      </div>
      <div className={cn(lead ? "mt-4" : "mt-3")}>{children}</div>
    </section>
  );
}

type BriefingSnapshotGridProps = {
  children: ReactNode;
  className?: string;
};

export function BriefingSnapshotGrid({ children, className }: BriefingSnapshotGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>{children}</div>
  );
}
