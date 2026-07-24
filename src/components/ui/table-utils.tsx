import { cn } from "@/lib/utils";

type TruncateCellProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  lines?: 1 | 2;
};

export function TruncateCell({
  children,
  className,
  title,
  lines = 2,
}: TruncateCellProps) {
  const reasonsText = typeof children === "string" ? children : title;

  return (
    <span
      className={cn(
        "block min-w-0 text-text-secondary",
        lines === 1 ? "truncate" : "line-clamp-2",
        className,
      )}
      title={title ?? reasonsText}
    >
      {children}
    </span>
  );
}

/**
 * Responsive column visibility utilities for data tables.
 * - col-mobile-hidden: hidden below md (768px)
 * - col-tablet-hidden: hidden below xl (1280px)
 */
export const tableColumnClasses = {
  mobileHidden: "hidden md:table-cell",
  tabletHidden: "hidden xl:table-cell",
  mobileOnly: "md:hidden",
  numeric: "text-right tabular-nums",
} as const;
