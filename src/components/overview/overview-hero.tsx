import { PageHero } from "@/components/ui/page-hero";
import { REPORTING_DATE } from "@/config/metrics";
import type { SystemSnapshotDto } from "@/lib/types/domain";
import { formatCount, formatReportingDate } from "@/lib/utils/formatters";

type OverviewHeroProps = {
  snapshot: SystemSnapshotDto;
};

export function OverviewHero({ snapshot }: OverviewHeroProps) {
  return (
    <PageHero
      title="Overview"
      eyebrow="Statewide capacity intelligence"
      headline="See where foster-home capacity needs attention."
      description="Understand recruitment pressure, provider engagement and upcoming license exposure across Illinois."
      actions={[
        { label: "Review recruitment", href: "/recruitment" },
        { label: "Review retention", href: "/retention" },
      ]}
      aside={
        <div className="hero-featured-panel">
          <p className="hero-eyebrow">Featured summary</p>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm text-[rgba(255,255,255,0.76)]">Children currently in care</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-white">
                {formatCount(snapshot.currentChildrenInCare)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[rgba(255,255,255,0.76)]">Current foster-home placements</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-white">
                {formatCount(snapshot.currentFosterHomeChildren)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[rgba(255,255,255,0.76)]">Data through</dt>
              <dd className="mt-1 text-sm font-medium text-white">
                <time dateTime={REPORTING_DATE}>{formatReportingDate(REPORTING_DATE)}</time>
              </dd>
            </div>
          </dl>
        </div>
      }
    />
  );
}
