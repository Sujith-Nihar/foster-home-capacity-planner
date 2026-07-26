import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionReveal } from "@/components/ui/section-reveal";
import { TextReveal } from "@/components/ui/text-reveal";
import { SectionShell } from "@/components/ui/section-shell";
import type {
  RetentionPriorityDistributionDto,
  RetentionSummaryDto,
  SystemSnapshotDto,
} from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type AttentionPanelProps = {
  snapshot: SystemSnapshotDto;
  retentionSummary: RetentionSummaryDto;
  retentionDistribution: RetentionPriorityDistributionDto;
};

type AttentionFinding = {
  count: number;
  label: string;
};

export function AttentionPanel({
  snapshot,
  retentionSummary,
  retentionDistribution,
}: AttentionPanelProps) {
  const findings: AttentionFinding[] = [
    {
      count: retentionSummary.licensesExpiringWithin90Days,
      label: "licenses end within 90 days",
    },
    {
      count: retentionDistribution.high,
      label: "providers meet high outreach criteria",
    },
    {
      count: snapshot.highRecruitmentCounties,
      label: "counties need both recruitment and near-term license-expiration review",
    },
  ];

  return (
    <SectionShell tone="dark" aria-labelledby="attention-panel-heading">
      <div className="content-container">
        <div className="mx-auto max-w-4xl space-y-6">
          <TextReveal
            as="h2"
            id="attention-panel-heading"
            variant="heading"
            className="eyebrow-label text-white/80"
            immediate
          >
            What needs attention
          </TextReveal>

          <SectionReveal delayMs={40}>
            <ul className="grid gap-4 sm:grid-cols-3">
              {findings.map((finding) => (
                <li
                  key={finding.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left"
                >
                  <p className="text-3xl font-semibold tabular-nums tracking-tight text-white sm:text-4xl">
                    {formatCount(finding.count)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/78">{finding.label}</p>
                </li>
              ))}
            </ul>
          </SectionReveal>

          <SectionReveal delayMs={80}>
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
