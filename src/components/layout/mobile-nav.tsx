"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { ReportingDateBadge } from "@/components/reporting-date-badge";
import { PrimaryNavigation } from "@/components/layout/primary-navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="icon"
        className="size-11 shrink-0"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-navigation-sheet"
        onClick={() => handleOpenChange(!open)}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          id="mobile-navigation-sheet"
          side="right"
          showCloseButton={false}
          className="flex w-[min(100%,18rem)] flex-col gap-0 p-0"
        >
          <SheetHeader className="space-y-3 border-b border-border-subtle px-5 py-5 text-left">
            <SheetTitle className="text-base font-medium leading-snug text-brand-navy">
              Illinois DCFS Capacity Planner
            </SheetTitle>
            <ReportingDateBadge className="text-sm" />
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <PrimaryNavigation orientation="vertical" onNavigate={() => handleOpenChange(false)} />
          </div>
          <div className="border-t border-border-subtle px-5 py-4">
            <Link
              href="/methodology"
              onClick={() => handleOpenChange(false)}
              className="inline-flex min-h-11 items-center text-sm font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Methodology definitions
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
