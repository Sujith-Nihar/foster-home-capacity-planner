import Link from "next/link";

import type { ExplainedOutreachReason } from "@/lib/retention/reason-display";
import { PROVIDER_OUTREACH_CAVEAT } from "@/content/methodology";
import { cn } from "@/lib/utils";

type ProviderOutreachExplanationProps = {
  reasons: ExplainedOutreachReason[];
  className?: string;
};

export function ProviderOutreachExplanation({
  reasons,
  className,
}: ProviderOutreachExplanationProps) {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="provider-outreach-explanation-heading"
    >
      <div className="space-y-1">
        <h2 id="provider-outreach-explanation-heading" className="text-lg font-semibold text-text-primary">
          Why this provider appears in the outreach list
        </h2>
        <p className="text-sm text-text-secondary">
          Plain-language outreach signals for staff review at the reporting date.
        </p>
      </div>

      <ul className="space-y-3">
        {reasons.map((reason) => (
          <li
            key={`${reason.primary}-${reason.triggeredRule ?? ""}`}
            className="rounded-2xl border border-border-subtle bg-surface-raised p-4"
          >
            <p className="text-sm font-medium text-text-primary">{reason.primary}</p>
          </li>
        ))}
      </ul>

        <p className="text-sm text-text-secondary">{PROVIDER_OUTREACH_CAVEAT}</p>

      <details className="rounded-2xl border border-border-subtle bg-surface-raised p-4">
        <summary className="cursor-pointer text-sm font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          How this category was calculated
        </summary>
        <div className="mt-3 space-y-4">
          {reasons.map((reason) => (
            <div key={`detail-${reason.primary}-${reason.triggeredRule ?? ""}`} className="space-y-2 text-sm">
              {reason.actualValue ? (
                <p>
                  <span className="font-medium text-text-primary">Actual value: </span>
                  <span className="text-text-secondary">{reason.actualValue}</span>
                </p>
              ) : null}
              {reason.triggeredRule ? (
                <p>
                  <span className="font-medium text-text-primary">Triggered rule: </span>
                  <span className="text-text-secondary">{reason.triggeredRule}</span>
                </p>
              ) : null}
              <p className="text-xs leading-5 text-text-tertiary">{reason.technical}</p>
            </div>
          ))}
          <Link
            href="/methodology#prototype-planning-rules"
            className="inline-flex text-sm font-medium text-brand-navy underline-offset-4 hover:underline"
          >
            View methodology
          </Link>
        </div>
      </details>
    </section>
  );
}
