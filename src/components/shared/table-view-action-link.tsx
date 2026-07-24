import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type TableViewActionLinkProps = {
  href: string;
  label: string;
  className?: string;
  ariaLabel?: string;
};

export function TableViewActionLink({ href, label, className, ariaLabel }: TableViewActionLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "table-view-action inline-flex h-10 min-h-10 w-max min-w-[128px] cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-[10px] border border-border-subtle bg-surface-raised/60 px-4 text-sm font-medium text-brand-navy",
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
