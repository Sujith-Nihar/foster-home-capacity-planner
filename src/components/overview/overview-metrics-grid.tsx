import Link from "next/link";

import { SectionReveal } from "@/components/ui/section-reveal";
import type { SystemSnapshotDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type OverviewMetricsGridProps = {
  snapshot: SystemSnapshotDto;
};

export function OverviewMetricsGrid({ snapshot }: OverviewMetricsGridProps) {
  const supportingStats = [
    {
      label: "Foster-home placements",
      value: formatCount(snapshot.currentFosterHomeChildren),
      href: "/recruitment",
    },
    {
      label: "Kin placements",
      value: formatCount(snapshot.currentKinChildren),
      href: "/recruitment",
    },
  ];

  const providerStats = [
    {
      label: "Licensed providers",
      value: formatCount(snapshot.currentlyLicensedProviders),
    },
    {
      label: "Engaged providers",
      value: formatCount(snapshot.currentlyActiveProviders),
    },
    {
      label: "High outreach",
      value: formatCount(snapshot.highRetentionProviders),
      href: "/retention?priority=High",
    },
  ];

  return (
    <section aria-labelledby="overview-kpi-heading" className="content-container overview-metrics">
      <SectionReveal>
        <h2
          id="overview-kpi-heading"
          className="overview-metrics__heading text-[clamp(1.625rem,2.5vw,2.125rem)] font-medium tracking-tight text-text-primary"
        >
          Statewide metrics
        </h2>
      </SectionReveal>

      <SectionReveal delayMs={80} className="overview-metrics__grid">
        <article className="overview-metric-card overview-metric-card--featured min-w-0">
          <p className="overview-metric-card__label">Current children in care</p>
          <p className="overview-metric-card__value overview-metric-card__value--featured">
            {formatCount(snapshot.currentChildrenInCare)}
          </p>
          <p className="overview-metric-card__helper">
            Children in Illinois foster care as of the reporting date.
          </p>
        </article>

        {supportingStats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            {stat.href ? (
              <Link href={stat.href} className="overview-metric-card overview-metric-card--tint overview-metric-card--link min-w-0">
                <p className="overview-metric-card__label">{stat.label}</p>
                <p className="overview-metric-card__value">{stat.value}</p>
              </Link>
            ) : (
              <article className="overview-metric-card overview-metric-card--tint min-w-0">
                <p className="overview-metric-card__label">{stat.label}</p>
                <p className="overview-metric-card__value">{stat.value}</p>
              </article>
            )}
          </div>
        ))}

        <div className="overview-metrics__provider-strip min-w-0">
          {providerStats.map((stat) => {
            const content = (
              <>
                <p className="overview-metric-card__label">{stat.label}</p>
                <p className="overview-metric-card__value overview-metric-card__value--compact">{stat.value}</p>
              </>
            );

            if (stat.href) {
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="overview-metric-card__provider-item overview-metric-card--link"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={stat.label} className="overview-metric-card__provider-item">
                {content}
              </div>
            );
          })}
        </div>
      </SectionReveal>
    </section>
  );
}
