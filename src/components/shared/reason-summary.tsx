import { AdditionalOutreachFactors } from "@/components/retention/additional-outreach-factors";
import { StackedTableCell } from "@/components/shared/stacked-table-cell";
import {
  formatOutreachReasonForDisplay,
  getPrimaryOutreachReasonForDisplay,
  type OutreachReasonContext,
} from "@/lib/retention/reason-display";
import { formatDayCount } from "@/lib/utils/pluralization";
import { cn } from "@/lib/utils";

type PrimaryReasonProps = {
  reasons: string[];
  context?: OutreachReasonContext;
  providerId?: number;
  className?: string;
};

export { formatOutreachReasonForDisplay, getPrimaryOutreachReasonForDisplay, type OutreachReasonContext };

export function PrimaryReason({ reasons, context, className }: PrimaryReasonProps) {
  if (reasons.length === 0) {
    return <span className={className}>—</span>;
  }

  const displayReasons = context
    ? reasons.map((reason) => formatOutreachReasonForDisplay(reason, context))
    : reasons;
  const [primary, ...additional] = displayReasons;

  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-sm leading-snug text-text-primary">{primary}</p>
      {additional.length > 0 ? <AdditionalOutreachFactors reasons={additional} /> : null}
    </div>
  );
}

/** @deprecated Use PrimaryReason for table cells. */
export function ReasonSummary({ reasons, className }: { reasons: string[]; className?: string }) {
  return <PrimaryReason reasons={reasons} className={className} />;
}

export function RetentionStatusCell({
  currentlyHasPlacement,
  daysSinceLastPlacement,
}: {
  currentlyHasPlacement: boolean;
  daysSinceLastPlacement: number | null;
}) {
  if (currentlyHasPlacement) {
    return <span className="text-sm text-text-primary">Has a current placement</span>;
  }

  return (
    <StackedTableCell
      primary="No current placement"
      secondary={
        daysSinceLastPlacement !== null
          ? `${daysSinceLastPlacement} days since last placement`
          : undefined
      }
      secondaryClassName="tabular-nums"
    />
  );
}

export function formatProviderStatus(currentlyHasPlacement: boolean): string {
  return currentlyHasPlacement ? "Has a current placement" : "No current placement";
}

export function formatDaysSinceLastPlacement(
  currentlyHasPlacement: boolean,
  daysSinceLastPlacement: number | null,
): string {
  if (currentlyHasPlacement) {
    return "Has a current placement";
  }

  if (daysSinceLastPlacement === null) {
    return "—";
  }

  return `${daysSinceLastPlacement} days`;
}

function licenseTimingEmphasisClass(daysUntilExpiration: number): string {
  if (daysUntilExpiration <= 30) {
    return "text-brand-navy font-medium";
  }

  if (daysUntilExpiration <= 90) {
    return "text-text-primary";
  }

  return "text-text-secondary";
}

export function formatLicenseTiming(
  licenseEndDate: string,
  daysUntilExpiration: number,
  formatDate: (value: string) => string,
) {
  return (
    <span className="block min-w-0 text-sm">
      <span
        className={cn(
          "block whitespace-nowrap tabular-nums",
          licenseTimingEmphasisClass(daysUntilExpiration),
        )}
      >
        Ends in {formatDayCount(daysUntilExpiration)}
      </span>
      <span className="block text-xs text-text-secondary whitespace-nowrap">
        {formatDate(licenseEndDate)}
      </span>
    </span>
  );
}

export function formatPlacementActivity(
  activeDaysLast365: number,
  engagementRateLast365: number | null,
) {
  return (
    <span className="block min-w-0 text-sm">
      <span className="block tabular-nums">
        {activeDaysLast365} days with an active placement
      </span>
      <span className="block text-xs text-text-secondary tabular-nums">
        {engagementRateLast365 === null
          ? "Eligible licensed days unavailable"
          : `${(engagementRateLast365 * 100).toFixed(1)}% of eligible licensed days`}
      </span>
    </span>
  );
}

/** @deprecated Use formatPlacementActivity. */
export function formatRecentEngagement(
  activeDaysLast365: number,
  engagementRateLast365: number | null,
) {
  return formatPlacementActivity(activeDaysLast365, engagementRateLast365);
}

export function StatusAndRenewalCell({
  currentlyHasPlacement,
  daysSinceLastPlacement,
  licenseEndDate,
  daysUntilExpiration,
  formatDate,
}: {
  currentlyHasPlacement: boolean;
  daysSinceLastPlacement: number | null;
  licenseEndDate: string;
  daysUntilExpiration: number;
  formatDate: (value: string) => string;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <RetentionStatusCell
        currentlyHasPlacement={currentlyHasPlacement}
        daysSinceLastPlacement={daysSinceLastPlacement}
      />
      {formatLicenseTiming(licenseEndDate, daysUntilExpiration, formatDate)}
    </div>
  );
}
