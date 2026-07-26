import { MethodologyLink } from "@/components/methodology-link";
import { OVERVIEW_PRIORITY_CALLOUT } from "@/content/methodology";

export function OverviewPlanningNote() {
  return (
    <aside
      className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3 sm:px-5"
      aria-labelledby="overview-planning-note-heading"
    >
      <h2 id="overview-planning-note-heading" className="text-sm font-semibold text-text-primary">
        {OVERVIEW_PRIORITY_CALLOUT.title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-text-secondary">{OVERVIEW_PRIORITY_CALLOUT.text}</p>
      <MethodologyLink label={OVERVIEW_PRIORITY_CALLOUT.actionLabel} className="mt-2" />
    </aside>
  );
}
