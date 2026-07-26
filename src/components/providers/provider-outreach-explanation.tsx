import type { ProviderMetricsDto } from "@/lib/types/domain";
import { RETENTION_OUTREACH_CAVEAT } from "@/content/methodology";
import {
  buildOutreachPrioritySummary,
  buildProviderCalculationDetails,
  buildProviderOutreachFactorStatements,
} from "@/lib/providers/outreach-factors";
import { cn } from "@/lib/utils";

import { ProviderCalculationDisclosure } from "./provider-calculation-disclosure";

type ProviderOutreachExplanationProps = {
  provider: ProviderMetricsDto;
  className?: string;
};

export function ProviderOutreachExplanation({
  provider,
  className,
}: ProviderOutreachExplanationProps) {
  const factorStatements = buildProviderOutreachFactorStatements(provider);
  const calculationDetails = buildProviderCalculationDetails(provider);

  if (factorStatements.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="provider-outreach-explanation-heading"
    >
      <div className="space-y-1">
        <h2 id="provider-outreach-explanation-heading" className="text-lg font-semibold text-text-primary">
          Why this provider appears in the outreach list
        </h2>
      </div>

      <div className="provider-outreach-reasons">
        <ul className="provider-outreach-reasons__list">
          {factorStatements.map((statement) => (
            <li key={statement}>{statement}</li>
          ))}
        </ul>

        <p className="provider-outreach-reasons__summary">
          {buildOutreachPrioritySummary(provider.outreachPriority)}
        </p>
      </div>

      <p className="text-sm text-text-secondary">{RETENTION_OUTREACH_CAVEAT}</p>

      <ProviderCalculationDisclosure details={calculationDetails} />
    </section>
  );
}
