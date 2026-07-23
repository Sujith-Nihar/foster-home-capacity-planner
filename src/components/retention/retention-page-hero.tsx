import { PageHero } from "@/components/ui/page-hero";
import type { RetentionSummaryDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type RetentionPageHeroProps = {
  summary: RetentionSummaryDto;
};

export function RetentionPageHero({ summary }: RetentionPageHeroProps) {
  return (
    <PageHero
      title="Retention"
      eyebrow="Licensed provider outreach"
      description="Licensed provider outreach priorities based on inactivity, engagement, and license expiration."
      variant="compact"
      actions={[{ label: "View expiring licenses", href: "/retention?expiration=within_90" }]}
      aside={
        <div className="rounded-[1.25rem] border border-border-subtle bg-surface-tint p-5">
          <p className="eyebrow-label text-text-tertiary">Featured metric</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
            {formatCount(summary.highOutreachPriorityProviders)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">High outreach priority providers</p>
        </div>
      }
    />
  );
}
