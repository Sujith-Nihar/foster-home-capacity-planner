import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionReveal } from "@/components/ui/section-reveal";
import { TextReveal } from "@/components/ui/text-reveal";
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
      <div className="content-container">
        <div className="mx-auto max-w-3xl space-y-6 text-center sm:text-left">
          <TextReveal as="h2" id="attention-panel-heading" className="eyebrow-label text-white/80">
            What needs attention
          </TextReveal>

          <SectionReveal delayClassName="fi-reveal-delay-content">
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
          </SectionReveal>

          <SectionReveal delayClassName="fi-reveal-delay-actions">
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link href="/retention?priority=High" className="fi-btn-dark-primary">
                Review retention
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/recruitment" className="fi-btn-dark-secondary">
                Explore recruitment
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </SectionReveal>
        </div>
      </div>
    </SectionShell>
  );
}
