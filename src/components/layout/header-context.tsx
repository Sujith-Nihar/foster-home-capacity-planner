"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

function resolveHeaderContext(pathname: string): {
  label: string;
  parent?: { label: string; href: string };
} | null {
  if (pathname === "/") {
    return null;
  }

  if (pathname === "/recruitment") {
    return { label: "Recruitment", parent: { label: "Overview", href: "/" } };
  }

  if (pathname.startsWith("/recruitment/")) {
    const county = decodeURIComponent(pathname.replace("/recruitment/", ""));
    return {
      label: `${county} County`,
      parent: { label: "Recruitment", href: "/recruitment" },
    };
  }

  if (pathname === "/retention") {
    return { label: "Retention", parent: { label: "Overview", href: "/" } };
  }

  if (pathname.startsWith("/providers/")) {
    const providerId = pathname.replace("/providers/", "");
    return {
      label: `Provider ${providerId}`,
      parent: { label: "Retention", href: "/retention" },
    };
  }

  if (pathname === "/methodology") {
    return { label: "Methodology", parent: { label: "Overview", href: "/" } };
  }

  return null;
}

export function HeaderContext() {
  const pathname = usePathname();
  const context = resolveHeaderContext(pathname);

  if (!context) {
    return null;
  }

  return (
    <nav aria-label="Current page" className="hidden min-w-0 items-center gap-1.5 text-sm lg:flex">
      {context.parent ? (
        <>
          <Link
            href={context.parent.href}
            className="truncate text-text-tertiary transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {context.parent.label}
          </Link>
          <ChevronRight className="size-3.5 shrink-0 text-text-tertiary" aria-hidden="true" />
        </>
      ) : null}
      <span className="truncate font-medium text-text-primary">{context.label}</span>
    </nav>
  );
}
