"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RECRUITMENT_ATTENTION_HELP } from "@/content/methodology";

export function RecruitmentAttentionHelpSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {RECRUITMENT_ATTENTION_HELP.title}
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto sm:max-w-md">
        <SheetHeader className="pr-10 text-left">
          <SheetTitle>{RECRUITMENT_ATTENTION_HELP.title}</SheetTitle>
          <SheetDescription className="sr-only">
            Recruitment attention methodology summary
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6 text-sm leading-6 text-text-secondary">
          <div>
            <p className="font-medium text-text-primary">Three indicators</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {RECRUITMENT_ATTENTION_HELP.indicators.map((indicator) => (
                <li key={indicator}>{indicator}</li>
              ))}
            </ul>
          </div>
          <p>
            <span className="font-medium text-text-primary">Comparison group: </span>
            {RECRUITMENT_ATTENTION_HELP.comparisonGroup}
          </p>
          <div>
            <p className="font-medium text-text-primary">Planning rules</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>High: {RECRUITMENT_ATTENTION_HELP.highRule}</li>
              <li>Medium: {RECRUITMENT_ATTENTION_HELP.mediumRule}</li>
            </ul>
          </div>
          <Link
            href="/methodology#prototype-planning-rules"
            className="inline-flex font-medium text-brand-navy underline-offset-4 hover:underline"
            onClick={() => setOpen(false)}
          >
            View full methodology
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
