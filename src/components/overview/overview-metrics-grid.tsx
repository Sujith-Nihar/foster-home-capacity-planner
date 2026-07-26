import Link from "next/link";

import { SectionReveal } from "@/components/ui/section-reveal";
import type { SystemSnapshotDto } from "@/lib/types/domain";
import { formatCount } from "@/lib/utils/formatters";

type OverviewMetricsGridProps = {
  snapshot: SystemSnapshotDto;
};

type MetricItem = {
  label: string;
  value: string;
  href?: string;
  helper?: string;
  featured?: boolean;
};

export function OverviewMetricsGrid({ snapshot }: OverviewMetricsGridProps) {
  const metrics: MetricItem[] = [
    {
      label: "Children currently in care",
      value: formatCount(snapshot.currentChildrenInCare),
      helper: "Children in Illinois foster care as of the reporting date.",
      featured: true,
    },
    {
      label: "Children currently in foster homes",
      value: formatCount(snapshot.currentFosterHomeChildren),
      href: "/recruitment",
    },
    {
      label: "Children in kin placements",
      value: formatCount(snapshot.currentKinChildren),
      href: "/recruitment",
    },
    {
      label: "Licensed providers",
      value: formatCount(snapshot.currentlyLicensedProviders),
      href: "/retention",
    },
    {
      label: "Engaged providers",
      value: formatCount(snapshot.currentlyActiveProviders),
      href: "/retention",
    },
    {
      label: "High-priority outreach providers",
      value: formatCount(snapshot.highRetentionProviders),
      href: "/retention?priority=High",
    },
  ];

  return (
    <section aria-labelledby="overview-kpi-heading" className="overview-metrics">
      <SectionReveal>
        <h2
          id="overview-kpi-heading"
          className="overview-metrics__heading text-[clamp(1.5rem,2.2vw,2rem)] font-medium tracking-tight text-text-primary"
        >
          Statewide snapshot
        </h2>
      </SectionReveal>

      <SectionReveal delayMs={60} className="overview-metrics__grid">
        {metrics.map((metric) => {
          const content = (
            <>
              <p className="overview-metric-card__label">{metric.label}</p>
              <p
                className={
                  metric.featured
                    ? "overview-metric-card__value overview-metric-card__value--featured"
                    : "overview-metric-card__value overview-metric-card__value--compact"
                }
              >
                {metric.value}
              </p>
              {metric.helper ? (
                <p className="overview-metric-card__helper">{metric.helper}</p>
              ) : null}
            </>
          );

          if (metric.href) {
            return (
              <Link
                key={metric.label}
                href={metric.href}
                className={`overview-metric-card overview-metric-card--link min-w-0 ${
                  metric.featured ? "overview-metric-card--featured" : "overview-metric-card--compact"
                }`}
              >
                {content}
              </Link>
            );
          }

          return (
            <article
              key={metric.label}
              className={`overview-metric-card min-w-0 ${
                metric.featured ? "overview-metric-card--featured" : "overview-metric-card--compact"
              }`}
            >
              {content}
            </article>
          );
        })}
      </SectionReveal>
    </section>
  );
}
