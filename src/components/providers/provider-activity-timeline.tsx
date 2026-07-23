import type { ProviderActivityPeriodDto } from "@/lib/types/domain";
import { buildProviderActivitySummary } from "@/lib/providers/detail";
import { formatCount, formatReportingDate } from "@/lib/utils/formatters";

type ProviderActivityTimelineProps = {
  activityPeriods: ProviderActivityPeriodDto[];
};

export function ProviderActivityTimeline({ activityPeriods }: ProviderActivityTimelineProps) {
  const summary = buildProviderActivitySummary(activityPeriods);

  return (
    <section aria-labelledby="provider-activity-heading" className="space-y-4">
      <h2 id="provider-activity-heading" className="text-lg font-semibold text-text-primary">
        Merged activity-period timeline
      </h2>
      <p className="text-sm text-text-secondary">{summary}</p>

      {activityPeriods.length === 0 ? (
        <p className="rounded-lg border border-border-default bg-surface-raised p-4 text-sm text-text-secondary" role="status">
          No placement activity periods are available for this provider.
        </p>
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
              <div className="rounded-lg border border-border-default bg-surface-raised p-4">
                <p className="text-sm font-medium text-text-primary">
                  <time dateTime={period.periodStart}>
                    {formatReportingDate(period.periodStart)}
                  </time>
                  {" – "}
                  <time dateTime={period.periodEnd}>{formatReportingDate(period.periodEnd)}</time>
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {formatCount(period.activeDays)} active placement days
                  {period.isCurrent ? " · Current period" : null}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
