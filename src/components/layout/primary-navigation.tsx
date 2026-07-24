"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { PRIMARY_NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type PrimaryNavigationProps = {
  className?: string;
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
};

export function PrimaryNavigation({
  className,
  onNavigate,
  orientation = "horizontal",
}: PrimaryNavigationProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLUListElement>(null);
  const [underline, setUnderline] = useState({ width: 0, left: 0 });

  const updateUnderline = useCallback(() => {
    if (!navRef.current || orientation !== "horizontal") {
      return;
    }

    const activeLink = navRef.current.querySelector<HTMLAnchorElement>(
      'a[aria-current="page"]',
    );

    if (!activeLink) {
      setUnderline({ width: 0, left: 0 });
      return;
    }

    const navRect = navRef.current.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    setUnderline({
      width: linkRect.width,
      left: linkRect.left - navRect.left,
    });
  }, [orientation]);

  useEffect(() => {
    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [pathname, updateUnderline]);

  const isHorizontal = orientation === "horizontal";

  return (
    <nav aria-label="Primary navigation" className={cn("relative", className)}>
      <ul
        ref={navRef}
        className={cn(
          isHorizontal ? "app-header-nav" : "flex flex-col gap-1",
        )}
      >
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "app-header-nav__link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isHorizontal ? "app-header-nav__link--horizontal" : "app-header-nav__link--vertical",
                  active
                    ? "app-header-nav__link--active"
                    : "app-header-nav__link--inactive",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {isHorizontal ? (
        <span
          className="app-header-nav__underline"
          style={{
            width: underline.width,
            transform: `translateX(${underline.left}px)`,
          }}
          aria-hidden="true"
        />
      ) : null}
    </nav>
  );
}
