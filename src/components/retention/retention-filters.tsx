"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { buildRetentionSortHref } from "@/lib/retention/query";
import type { RetentionSearchParams } from "@/lib/validation/search-params";

type SortHeaderProps = {
  label: string;
  sortKey: RetentionSearchParams["sort"];
  searchParams: RetentionSearchParams;
};

export function RetentionSortHeader({ label, sortKey, searchParams }: SortHeaderProps) {
  const isActive = searchParams.sort === sortKey;
  const Icon = !isActive ? ArrowUpDown : searchParams.direction === "asc" ? ArrowUp : ArrowDown;
  const href = buildRetentionSortHref(searchParams, sortKey);

  return (
    <Link
      href={href}
      scroll={false}
      className="inline-flex items-center gap-1 font-medium text-text-primary hover:text-brand-navy hover:underline"
    >
      {label}
      <Icon className="size-3.5 text-text-tertiary" aria-hidden="true" />
      {isActive ? <span className="sr-only">sorted {searchParams.direction}</span> : null}
    </Link>
  );
}
