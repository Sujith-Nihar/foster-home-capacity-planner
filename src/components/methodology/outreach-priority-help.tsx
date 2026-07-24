import Link from "next/link";

import { RETENTION_METRICS, RETENTION_OUTREACH_HELP, RETENTION_OUTREACH_RULES } from "@/content/methodology";

type OutreachPriorityHelpProps = {
  className?: string;
};

export function OutreachPriorityHelp({ className }: OutreachPriorityHelpProps) {
  return (
    <details className={className}>
      <summary className="cursor-pointer text-sm font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {RETENTION_OUTREACH_HELP.title}
      </summary>
      <div className="mt-3 space-y-3 rounded-2xl border border-border-subtle bg-surface-raised p-4 text-sm leading-6 text-text-secondary">
        <p>{RETENTION_OUTREACH_HELP.explanation}</p>
        <div>
          <p className="font-medium text-text-primary">High outreach</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {RETENTION_OUTREACH_RULES.high.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-text-primary">Medium outreach</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {RETENTION_OUTREACH_RULES.medium.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        <p>{RETENTION_METRICS.outreachPriority.limitation}</p>
        <Link
          href="/methodology#prototype-planning-rules"
          className="inline-flex font-medium text-brand-navy underline-offset-4 hover:underline"
        >
          View full methodology
        </Link>
      </div>
    </details>
  );
}
