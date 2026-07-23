import { PageHero } from "@/components/ui/page-hero";
import { MethodologyLink } from "@/components/methodology-link";
import type { CountyMetricsDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type RecruitmentPageHeroProps = {
  eligibleCounties: CountyMetricsDto[];
};

export function RecruitmentPageHero({ eligibleCounties }: RecruitmentPageHeroProps) {
  const highPriorityCount = eligibleCounties.filter(
    (county) => county.recruitmentPriority === "High",
  ).length;

  return (
    <PageHero
      title="Recruitment"
      eyebrow="County planning priorities"
      description="County-level foster home recruitment planning priorities based on current placement pressure."
      variant="compact"
      aside={
        <div className="rounded-[1.25rem] border border-border-subtle bg-surface-tint p-5">
          <p className="eyebrow-label text-text-tertiary">Featured metric</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
            {formatCount(highPriorityCount)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">High-priority recruitment counties</p>
          <MethodologyLink
            label="Review recruitment methodology"
            className="mt-4 inline-flex text-sm"
          />
        </div>
      }
    />
  );
}
