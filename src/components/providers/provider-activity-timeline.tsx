import type { ProviderActivityPeriodDto, ProviderMetricsDto } from "@/lib/types/domain";
import { formatActiveDayCount } from "@/lib/utils/pluralization";
import { formatCount, formatReportingDate } from "@/lib/utils/formatters";

type ProviderActivityTimelineProps = {
  provider: ProviderMetricsDto;
  activityPeriods: ProviderActivityPeriodDto[];
};

function ActivityPeriodCard({ period }: { period: ProviderActivityPeriodDto }) {
  return (
    <div className="rounded-lg border border-border-default bg-surface-raised p-4">
      <p className="text-sm font-medium text-text-primary">
        <time dateTime={period.periodStart}>{formatReportingDate(period.periodStart)}</time>
        {" – "}
        <time dateTime={period.periodEnd}>{formatReportingDate(period.periodEnd)}</time>
      </p>
      <p className="mt-1 text-sm text-text-secondary">
        {formatActiveDayCount(period.activeDays)}
        {period.isCurrent ? " · Current period" : null}
      </p>
    </div>
  );
}

export function ProviderActivityTimeline({
  provider,
  activityPeriods,
}: ProviderActivityTimelineProps) {
  return (
    <section aria-labelledby="provider-activity-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="provider-activity-heading" className="text-lg font-semibold text-text-primary">
          Placement-activity history
        </h2>
        <p className="text-sm text-text-secondary">
          Recorded periods when the provider had at least one active foster-home placement.
        </p>
      </div>

      <p className="text-sm text-text-secondary">
        {formatCount(provider.totalActiveDays)} total active placement days across recorded history.
      </p>

      {activityPeriods.length === 0 ? (
        <p
          className="rounded-lg border border-border-default bg-surface-raised p-4 text-sm text-text-secondary"
          role="status"
        >
          No placement activity periods are available for this provider.
        </p>
      ) : activityPeriods.length === 1 ? (
        <ActivityPeriodCard period={activityPeriods[0]} />
      ) : (
        <ol
          className="relative space-y-6 border-l border-border-default pl-6"
          aria-label="Foster-home placement activity periods"
        >
          {activityPeriods.map((period) => (
            <li key={`${period.periodStart}-${period.periodEnd}`} className="relative">
              <span
                className="absolute top-1 -left-[1.625rem] size-3 rounded-full border-2 border-accent-brand bg-surface-raised"
                aria-hidden="true"
              />
              <ActivityPeriodCard period={period} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
