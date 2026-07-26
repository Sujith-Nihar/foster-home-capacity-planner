"use client";

import Link from "next/link";

import { AccessibleInfoPopover } from "@/components/shared/accessible-info-popover";
import { RETENTION_OUTREACH_RULES } from "@/content/methodology";

export function RetentionOutreachMethodologyNote() {
  return (
    <p className="max-w-3xl text-sm leading-6 text-text-secondary">
      Suggested outreach priority is a transparent staff-review category based on placement
      inactivity, placement activity during the past 12 months, and license timing. It does not
      predict closure, non-renewal, or provider performance.{" "}
      <AccessibleInfoPopover
        triggerContent={
          <span className="font-medium text-brand-navy underline-offset-4 hover:underline">
            How suggested outreach priority is calculated
          </span>
        }
        triggerLabel="How suggested outreach priority is calculated. Show details."
        contentClassName="retention-methodology-popover"
        side="top"
        allowPopupHover
      >
        <div className="retention-methodology-popover__content space-y-3">
          <div>
            <p className="font-medium text-text-primary">High outreach</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-5 text-text-secondary">
              {RETENTION_OUTREACH_RULES.high.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-text-primary">Medium outreach</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-5 text-text-secondary">
              {RETENTION_OUTREACH_RULES.medium.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-text-primary">Low outreach</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-5 text-text-secondary">
              {RETENTION_OUTREACH_RULES.low.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
          <Link
            href="/methodology#methodology-retention-rules"
            className="inline-flex text-xs font-medium text-brand-navy underline-offset-4 hover:underline"
          >
            View full methodology
          </Link>
        </div>
      </AccessibleInfoPopover>
    </p>
  );
}
