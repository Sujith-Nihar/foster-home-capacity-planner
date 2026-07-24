import { MethodologyLink } from "@/components/methodology-link";
import { OVERVIEW_PRIORITY_CALLOUT } from "@/content/methodology";

export function PlanningPriorityCallout() {
  return (
    <aside
      className="rounded-2xl border border-border-subtle bg-surface-raised px-4 py-3 sm:px-5"
      aria-labelledby="planning-priority-callout-heading"
    >
      <h2
        id="planning-priority-callout-heading"
        className="text-sm font-semibold text-text-primary"
      >
        {OVERVIEW_PRIORITY_CALLOUT.title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-text-secondary">{OVERVIEW_PRIORITY_CALLOUT.text}</p>
      <MethodologyLink
        label={OVERVIEW_PRIORITY_CALLOUT.actionLabel}
        className="mt-2"
      />
    </aside>
  );
}
