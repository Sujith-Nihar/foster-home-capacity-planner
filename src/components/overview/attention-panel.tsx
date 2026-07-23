import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { SectionShell } from "@/components/ui/section-shell";
import type {
  OverviewInsightsDto,
  RetentionPriorityDistributionDto,
  RetentionSummaryDto,
  SystemSnapshotDto,
} from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type AttentionPanelProps = {
  insights: OverviewInsightsDto;
  snapshot: SystemSnapshotDto;
  retentionSummary: RetentionSummaryDto;
  retentionDistribution: RetentionPriorityDistributionDto;
};

export function AttentionPanel({
  insights,
  snapshot,
  retentionSummary,
  retentionDistribution,
}: AttentionPanelProps) {
  const findings = [
    `${formatCount(retentionSummary.licensesExpiringWithin90Days)} licenses expire within 90 days.`,
    `${formatCount(retentionDistribution.high)} providers currently meet high outreach-priority criteria.`,
    `${formatCount(snapshot.highRecruitmentCounties)} counties have high recruitment planning priority.`,
  ];

  return (
    <SectionShell tone="attention" aria-labelledby="attention-panel-heading">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-start">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow-label text-status-medium">Attention areas</p>
            <h2
              id="attention-panel-heading"
              className="flex items-center gap-2 text-2xl font-medium tracking-tight text-text-primary"
            >
              <Sparkles className="size-5 text-status-medium" aria-hidden="true" />
              What needs attention
            </h2>
            <p className="text-sm leading-6 text-text-secondary">{insights.headline}</p>
          </div>
          <ul className="space-y-3 text-sm text-text-primary">
            {findings.map((finding) => (
              <li key={finding} className="flex gap-3">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-status-medium"
                  aria-hidden="true"
                />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/retention?priority=High"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-status-medium-border bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Review retention priorities
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/recruitment"
              className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-accent-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore recruitment needs
            </Link>
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-status-medium-border bg-surface-raised/80 p-5">
          <p className="eyebrow-label text-text-tertiary">Supporting signals</p>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs text-text-tertiary">Licenses expiring ≤ 90 days</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">
                {formatCount(retentionSummary.licensesExpiringWithin90Days)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">High outreach priority</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">
                {formatCount(retentionDistribution.high)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">High recruitment counties</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">
                {formatCount(snapshot.highRecruitmentCounties)}
              </dd>
            </div>
          </dl>
          <ul className="mt-5 space-y-2 border-t border-border-subtle pt-4 text-xs leading-5 text-text-secondary">
            {insights.bullets.slice(0, 2).map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
