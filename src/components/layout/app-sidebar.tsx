"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_TITLE, PRIMARY_NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="border-b border-sidebar-border px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Illinois DCFS
        </p>
        <p className="mt-1 text-sm font-semibold leading-5 text-text-primary">{APP_TITLE}</p>
      </div>
      <nav aria-label="Primary" className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-text-secondary hover:bg-sidebar-accent hover:text-text-primary",
                  )}
                >
                  <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="flex flex-col gap-0.5">
                    <span>{item.label}</span>
                    <span className="text-xs font-normal text-text-secondary" aria-hidden="true">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
