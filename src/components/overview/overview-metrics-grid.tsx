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
    <section aria-labelledby="overview-kpi-heading" className="space-y-6">
      <SectionReveal>
        <h2
          id="overview-kpi-heading"
          className="text-[clamp(1.625rem,2.5vw,2.125rem)] font-medium tracking-tight text-text-primary"
        >
          Statewide metrics
        </h2>
      </SectionReveal>

      <SectionReveal>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-stretch">
          <div className="metric-card-surface flex flex-col justify-center p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.08em] text-text-secondary">
              Current children in care
            </p>
            <p className="mt-3 text-[clamp(2.75rem,5vw,4rem)] font-medium leading-none tabular-nums tracking-tight text-brand-navy">
              {formatCount(snapshot.currentChildrenInCare)}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
              Children in Illinois foster care as of the reporting date.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {supportingStats.map((stat) => (
              <div key={stat.label} className="h-full">
                {stat.href ? (
                  <Link
                    href={stat.href}
                    className="metric-card-surface metric-card-surface--tint block h-full p-5 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <p className="text-sm text-text-primary">{stat.label}</p>
                    <p className="mt-2 text-3xl font-medium tabular-nums text-brand-navy">{stat.value}</p>
                  </Link>
                ) : (
                  <div className="metric-card-surface metric-card-surface--tint h-full p-5">
                    <p className="text-sm text-text-primary">{stat.label}</p>
                    <p className="mt-2 text-3xl font-medium tabular-nums text-brand-navy">{stat.value}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal>
        <div className="metric-card-surface metric-card-surface--tint grid gap-4 p-5 sm:grid-cols-3 sm:gap-6 sm:p-6">
          {providerStats.map((stat) => {
            const content = (
              <>
                <p className="text-sm text-text-primary">{stat.label}</p>
                <p className="mt-1 text-2xl font-medium tabular-nums text-brand-navy sm:text-[1.75rem]">
                  {stat.value}
                </p>
              </>
            );

            if (stat.href) {
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="block rounded-lg transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {content}
                </Link>
              );
            }

            return <div key={stat.label}>{content}</div>;
          })}
        </div>
      </SectionReveal>
    </section>
  );
}
