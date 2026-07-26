"use client";

import { Info } from "lucide-react";

import { AccessibleInfoPopover } from "@/components/shared/accessible-info-popover";
import Link from "next/link";

const COLUMN_HELP = {
  placementActivity:
    "Counts calendar days during the past 12 months when the provider had at least one active foster-home placement. Overlapping placements count only once per day.",
  outreachPriority: {
    high: "Meets at least one High outreach rule.",
    medium: "Meets at least one Medium outreach rule and no High rule.",
    low: "No High or Medium rule applies.",
    caveat:
      "These categories support staff review. They do not predict provider closure, license non-renewal, or provider performance.",
  },
} as const;

export function PlacementActivityColumnHelp() {
  return (
    <AccessibleInfoPopover
      triggerContent={
        <span className="inline-flex items-center text-text-tertiary">
          <Info className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Placement activity explanation</span>
        </span>
      }
      triggerLabel="Placement activity explanation. Show details."
      contentClassName="retention-column-help-popover"
      side="top"
    >
      <p className="retention-column-help-popover__body">{COLUMN_HELP.placementActivity}</p>
    </AccessibleInfoPopover>
  );
}

export function OutreachPriorityColumnHelp() {
  return (
    <AccessibleInfoPopover
      triggerContent={
        <span className="inline-flex items-center text-text-tertiary">
          <Info className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Suggested outreach priority explanation</span>
        </span>
      }
      triggerLabel="Suggested outreach priority explanation. Show details."
      contentClassName="retention-column-help-popover"
      side="top"
    >
      <div className="retention-column-help-popover__content space-y-2">
        <p className="retention-column-help-popover__body">
          <span className="font-medium text-text-primary">High: </span>
          {COLUMN_HELP.outreachPriority.high}
        </p>
        <p className="retention-column-help-popover__body">
          <span className="font-medium text-text-primary">Medium: </span>
          {COLUMN_HELP.outreachPriority.medium}
        </p>
        <p className="retention-column-help-popover__body">
          <span className="font-medium text-text-primary">Low: </span>
          {COLUMN_HELP.outreachPriority.low}
        </p>
        <p className="retention-column-help-popover__body">{COLUMN_HELP.outreachPriority.caveat}</p>
        <Link
          href="/methodology#prototype-planning-rules"
          className="inline-flex text-xs font-medium text-brand-navy underline-offset-4 hover:underline"
        >
          View full methodology
        </Link>
      </div>
    </AccessibleInfoPopover>
  );
}
