import {
  buildStaffFacingRetentionOutreachRules,
  METHODOLOGY_RETENTION_ACTIVITY_NOTE,
  METHODOLOGY_RETENTION_MEDIUM_NOTE,
  METHODOLOGY_RETENTION_RULES_INTRO,
} from "@/lib/methodology/page-content";

export function MethodologyRetentionRulesSection() {
  const rules = buildStaffFacingRetentionOutreachRules();

  return (
    <section
      id="methodology-retention-rules"
      aria-labelledby="methodology-retention-rules-heading"
      className="methodology-panel methodology-scroll-target"
    >
      <h2
        id="methodology-retention-rules-heading"
        className="text-lg font-semibold text-text-primary"
      >
        Suggested outreach priority
      </h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
        {METHODOLOGY_RETENTION_RULES_INTRO}
      </p>

      <div className="mt-4 space-y-4">
        <div className="methodology-rules-card">
          <h3 className="methodology-rules-card__title">High suggested outreach</h3>
          <ul className="methodology-rules-card__list">
            {rules.high.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="methodology-rules-card">
          <h3 className="methodology-rules-card__title">Medium suggested outreach</h3>
          <ul className="methodology-rules-card__list">
            {rules.medium.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <p className="methodology-rules-card__note">{METHODOLOGY_RETENTION_MEDIUM_NOTE}</p>
        </div>

        <div className="methodology-rules-card">
          <h3 className="methodology-rules-card__title">Low suggested outreach</h3>
          <ul className="methodology-rules-card__list">
            {rules.low.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <p className="text-sm leading-6 text-text-secondary">{METHODOLOGY_RETENTION_ACTIVITY_NOTE}</p>
      </div>
    </section>
  );
}
