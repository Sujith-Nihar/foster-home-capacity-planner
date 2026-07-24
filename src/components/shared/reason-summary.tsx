import Link from "next/link";

import { StackedTableCell } from "@/components/shared/stacked-table-cell";
import {
  formatOutreachReasonForDisplay,
  type OutreachReasonContext,
} from "@/lib/retention/reason-display";
import { cn } from "@/lib/utils";

type PrimaryReasonProps = {
  reasons: string[];
  context?: OutreachReasonContext;
  providerId?: number;
  className?: string;
};

function formatAdditionalFactorsLabel(count: number): string {
  return count === 1 ? "+1 additional factor" : `+${count} additional factors`;
}

export { formatOutreachReasonForDisplay, type OutreachReasonContext };

export function PrimaryReason({ reasons, context, providerId, className }: PrimaryReasonProps) {
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
      {additional.length > 0 ? (
        providerId ? (
          <Link
            href={`/providers/${providerId}`}
            className="mt-0.5 inline-block text-xs font-medium text-brand-navy underline-offset-2 hover:underline"
          >
            {formatAdditionalFactorsLabel(additional.length)}
          </Link>
        ) : (
          <p className="mt-0.5 text-xs font-medium text-brand-navy">
            {formatAdditionalFactorsLabel(additional.length)}
          </p>
        )
      ) : null}
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
    return <span className="text-sm text-text-primary">Currently active</span>;
  }

  return (
    <StackedTableCell
      primary="Inactive"
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
  return currentlyHasPlacement ? "Currently active" : "Inactive";
}

export function formatDaysSinceLastPlacement(
  currentlyHasPlacement: boolean,
  daysSinceLastPlacement: number | null,
): string {
  if (currentlyHasPlacement) {
    return "Currently active";
  }

  if (daysSinceLastPlacement === null) {
    return "—";
  }

  return `${daysSinceLastPlacement} days`;
}

export function formatLicenseTiming(
  licenseEndDate: string,
  daysUntilExpiration: number,
  formatDate: (value: string) => string,
) {
  return (
    <span className="block min-w-0 text-sm">
      <span className="block whitespace-nowrap">{formatDate(licenseEndDate)}</span>
      <span className="block text-xs text-text-secondary tabular-nums">
        {daysUntilExpiration} days remaining
      </span>
    </span>
  );
}

export function formatRecentEngagement(
  activeDaysLast365: number,
  engagementRateLast365: number | null,
) {
  return (
    <span className="block min-w-0 text-sm tabular-nums">
      <span className="block">{activeDaysLast365} active days</span>
      <span className="block text-xs text-text-secondary">
        {engagementRateLast365 === null
          ? "Recent activity unavailable"
          : `${(engagementRateLast365 * 100).toFixed(1)}% of eligible days`}
      </span>
    </span>
  );
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
