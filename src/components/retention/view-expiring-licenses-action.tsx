"use client";

import Link from "next/link";

import {
  buildExpiringLicensesHref,
  isExpiringLicensesViewActive,
} from "@/lib/retention/expiring-licenses";
import { scrollToRetentionProviderList } from "@/lib/retention/scroll-to-provider-list";
import { cn } from "@/lib/utils";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

type ViewExpiringLicensesActionProps = {
  searchParams: RetentionSearchParams;
  variant?: "primary" | "panel";
  className?: string;
};

const VARIANT_CLASSES = {
  primary:
    "fi-btn-primary min-h-11 h-11 px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  panel:
    "inline-flex min-h-11 h-11 shrink-0 items-center justify-center rounded-full border border-status-medium-border bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
} as const;

export function ViewExpiringLicensesAction({
  searchParams,
  variant = "panel",
  className,
}: ViewExpiringLicensesActionProps) {
  const isActive = isExpiringLicensesViewActive(searchParams);
  const label = isActive
    ? "View provider list"
    : "View providers with licenses ending within 90 days";

  if (isActive) {
    return (
      <button
        type="button"
        className={cn(VARIANT_CLASSES[variant], className)}
        aria-label={label}
        onClick={() => scrollToRetentionProviderList()}
      >
        {label}
      </button>
    );
  }

  return (
    <Link
      href={buildExpiringLicensesHref()}
      className={cn(VARIANT_CLASSES[variant], className)}
      aria-label={label}
    >
      {label}
    </Link>
  );
}
