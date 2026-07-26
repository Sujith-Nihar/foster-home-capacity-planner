import Link from "next/link";

import { OutreachPriorityBadge } from "@/components/retention/outreach-priority-badge";
import { buildProviderFlagNarrativeSummary } from "@/lib/providers/outreach-factors";
import type { ProviderMetricsDto } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

type ProviderDetailHeaderProps = {
  provider: ProviderMetricsDto;
  providerLabel: string;
  countyHref: string;
  countyLabel: string;
  primaryOutreachReason: string | null;
  className?: string;
};

export function ProviderDetailHeader({
  provider,
  providerLabel,
  countyHref,
  countyLabel,
  primaryOutreachReason,
  className,
}: ProviderDetailHeaderProps) {
  const narrativeSummary = buildProviderFlagNarrativeSummary(provider);
  const hasOutreachSignal =
    provider.outreachReasons.length > 0 &&
    !provider.outreachReasons.every(
      (reason) => reason === "No elevated outreach signals at the reporting date",
    );

  return (
    <header className={cn("provider-detail-header", className)}>
      <div className="provider-detail-header__title-row">
        <div className="provider-detail-header__identity min-w-0">
          <h1 id="page-intro-title" className="provider-detail-header__title">
            {providerLabel}
          </h1>
          <p className="provider-detail-header__subtext">
            Licensed provider in{" "}
            <Link
              href={countyHref}
              className="font-medium text-brand-navy underline-offset-4 hover:underline"
            >
              {countyLabel}
            </Link>
          </p>
        </div>
        {hasOutreachSignal ? (
          <div className="provider-detail-header__badge">
            <OutreachPriorityBadge
              priority={provider.outreachPriority}
              primaryReason={primaryOutreachReason}
            />
          </div>
        ) : null}
      </div>

      {narrativeSummary ? (
        <div className="provider-detail-header__summary-panel">
          <p className="text-sm leading-6 text-text-primary">{narrativeSummary}</p>
        </div>
      ) : null}
    </header>
  );
}
