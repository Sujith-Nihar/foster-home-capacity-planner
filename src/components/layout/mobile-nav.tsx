"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { PrimaryNavigation } from "@/components/layout/primary-navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
      <SheetContent side="left" className="flex w-[min(100%,16rem)] flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border-default px-5 py-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
            Foster Insights
          </p>
          <SheetTitle className="text-[15px] font-medium text-text-primary">
            Illinois DCFS Capacity Planner
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <PrimaryNavigation orientation="vertical" onNavigate={() => setOpen(false)} />
        </div>
        <div className="mt-auto border-t border-border-default px-5 py-4">
          <Link
            href="/methodology"
            onClick={() => setOpen(false)}
            className="inline-flex text-xs font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Methodology definitions
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
