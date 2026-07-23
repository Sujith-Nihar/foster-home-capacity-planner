"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PRIMARY_NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type PrimaryNavProps = {
  className?: string;
  onNavigate?: () => void;
};

export function PrimaryNav({ className, onNavigate }: PrimaryNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={className}>
      <ul className="space-y-1">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "interactive-lift relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]"
                    : "font-medium text-text-secondary hover:bg-muted/80 hover:text-text-primary",
                )}
              >
                {active ? (
                  <span
                    className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent-brand"
                    aria-hidden="true"
                  />
                ) : null}
                <Icon
                  className={cn(
                    "size-[18px] shrink-0",
                    active ? "text-accent-brand" : "text-text-tertiary",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
