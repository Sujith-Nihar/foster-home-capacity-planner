"use client";

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
};

export function ErrorState({ title, description, actions, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 rounded-lg border border-status-high-border bg-status-high-bg p-6",
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-status-high" aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-status-high">{title}</h2>
          <p className="max-w-prose text-sm text-text-secondary">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2 pl-8">{actions}</div> : null}
    </div>
  );
}
