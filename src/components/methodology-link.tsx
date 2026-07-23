import Link from "next/link";
import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type MethodologyLinkProps = {
  className?: string;
  label?: string;
};

export function MethodologyLink({
  className,
  label = "View methodology and definitions",
}: MethodologyLinkProps) {
  return (
    <Link
      href="/methodology"
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-accent-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <BookOpen className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
}
