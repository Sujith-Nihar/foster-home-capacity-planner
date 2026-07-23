"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { PrimaryNav } from "@/components/layout/primary-nav";
import { APP_BRAND_NAME } from "@/config/navigation";
import { REPORTING_DATE } from "@/config/metrics";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatReportingDate } from "@/lib/utils/formatters";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-4" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[min(100%,15rem)] flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border-default px-5 py-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
            Illinois DCFS
          </p>
          <SheetTitle className="text-[15px] font-semibold">{APP_BRAND_NAME}</SheetTitle>
        </SheetHeader>
        <PrimaryNav className="flex-1 overflow-y-auto px-3 py-4" onNavigate={() => setOpen(false)} />
        <div className="mt-auto border-t border-border-default px-5 py-4">
          <p className="text-xs text-text-tertiary">
            Data through{" "}
            <time dateTime={REPORTING_DATE} className="font-medium text-text-secondary">
              {formatReportingDate(REPORTING_DATE)}
            </time>
          </p>
          <Link
            href="/methodology"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex text-xs font-medium text-accent-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Methodology definitions
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
