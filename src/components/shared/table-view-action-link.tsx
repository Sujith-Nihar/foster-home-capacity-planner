import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type TableViewActionLinkProps = {
  href: string;
  label: string;
  className?: string;
  ariaLabel?: string;
  compact?: boolean;
};

export function TableViewActionLink({
  href,
  label,
  className,
  ariaLabel,
  compact = false,
}: TableViewActionLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "table-view-action inline-flex h-10 min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-border-subtle bg-surface-raised/60 text-sm font-medium text-brand-navy",
        compact
          ? "w-full max-w-full min-w-0 box-border px-3"
          : "w-max min-w-[128px] px-4",
        "hover:border-brand-blue/35 hover:bg-brand-blue/8",
        "focus-visible:border-brand-blue/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25",
        className,
      )}
    >
      {label}
      <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
    </Link>
  );
}
