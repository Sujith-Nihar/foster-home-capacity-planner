import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionReveal } from "@/components/ui/section-reveal";
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
  snapshot,
  retentionSummary,
  retentionDistribution,
}: AttentionPanelProps) {
  const findings = [
    `${formatCount(retentionSummary.licensesExpiringWithin90Days)} provider licenses end within 90 days.`,
    `${formatCount(retentionDistribution.high)} providers currently meet high outreach criteria.`,
    `${formatCount(snapshot.highRecruitmentCounties)} counties combine high placement pressure with near-term provider-license exposure.`,
  ];

  return (
    <SectionShell tone="dark" aria-labelledby="attention-panel-heading">
      <div className="app-container">
        <SectionReveal>
          <div className="mx-auto max-w-3xl space-y-6 text-center sm:text-left">
            <div className="space-y-3">
              <h2
                id="attention-panel-heading"
                className="eyebrow-label text-white/80"
              >
                What needs attention
              </h2>
            </div>
            <ul className="space-y-3 text-base leading-relaxed text-white/78">
              {findings.map((finding) => (
                <li key={finding} className="flex gap-3 sm:items-start">
                  <span
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-blue"
                    aria-hidden="true"
                  />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link
                href="/retention?priority=High"
                className="fi-btn-primary inline-flex items-center gap-2 bg-white text-brand-navy hover:bg-brand-blue-soft"
              >
                Review retention
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/recruitment"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Explore recruitment
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </SectionShell>
  );
}
