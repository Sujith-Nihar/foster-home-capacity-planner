import { cn } from "@/lib/utils";

type PrimaryReasonProps = {
  reasons: string[];
  moreOnPageLabel?: string;
  className?: string;
  hideMoreOnNarrow?: boolean;
};

export function PrimaryReason({
  reasons,
  moreOnPageLabel,
  className,
  hideMoreOnNarrow = false,
}: PrimaryReasonProps) {
  if (reasons.length === 0) {
    return <span className={className}>—</span>;
  }

  const [primary, ...additional] = reasons;

  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-sm leading-snug text-text-primary" title={primary}>
        {primary}
      </p>
      {additional.length > 0 && moreOnPageLabel ? (
        <p
          className={cn(
            "mt-0.5 text-xs font-medium text-brand-navy",
            hideMoreOnNarrow && "hidden lg:block",
          )}
        >
          +{additional.length} more on {moreOnPageLabel}
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated Use PrimaryReason for table cells. */
export function ReasonSummary({ reasons, className }: { reasons: string[]; className?: string }) {
  return <PrimaryReason reasons={reasons} className={className} />;
}

export function formatProviderStatus(currentlyHasPlacement: boolean): string {
  return currentlyHasPlacement ? "Currently active" : "Inactive";
}

export function formatDaysSinceLastPlacement(
  currentlyHasPlacement: boolean,
  daysSinceLastPlacement: number | null,
): string {
  if (currentlyHasPlacement) {
    return "—";
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
  options?: { hideSecondaryOnNarrow?: boolean },
) {
  return (
    <span className="block min-w-0 text-sm tabular-nums">
      <span className="block">{activeDaysLast365} active days</span>
      <span
        className={cn(
          "block text-xs text-text-secondary",
          options?.hideSecondaryOnNarrow && "hidden lg:block",
        )}
      >
        {engagementRateLast365 === null
          ? "Engagement unavailable"
          : `${(engagementRateLast365 * 100).toFixed(1)}% of eligible days`}
      </span>
    </span>
  );
}
