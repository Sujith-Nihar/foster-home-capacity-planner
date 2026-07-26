import Link from "next/link";

import { RECRUITMENT_ATTENTION_HELP } from "@/content/methodology";

type RecruitmentAttentionHelpProps = {
  className?: string;
};

export function RecruitmentAttentionHelp({ className }: RecruitmentAttentionHelpProps) {
  return (
    <details className={className}>
      <summary className="cursor-pointer text-sm font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {RECRUITMENT_ATTENTION_HELP.title}
      </summary>
      <div className="mt-3 space-y-3 rounded-2xl border border-border-subtle bg-surface-raised p-4 text-sm leading-6 text-text-secondary">
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
        <p>{RECRUITMENT_ATTENTION_HELP.caveat}</p>
        <Link
          href="/methodology#methodology-recruitment-rules"
          className="inline-flex font-medium text-brand-navy underline-offset-4 hover:underline"
        >
          View full methodology
        </Link>
      </div>
    </details>
  );
}
