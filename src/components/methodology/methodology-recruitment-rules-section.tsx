import {
  METHODOLOGY_HIGHEST_QUARTER_CALLOUT,
  METHODOLOGY_RECRUITMENT_COMPARISON_REQUIREMENTS,
  METHODOLOGY_RECRUITMENT_INDICATORS,
  METHODOLOGY_RECRUITMENT_LEVELS,
  METHODOLOGY_RECRUITMENT_RULES_INTRO,
} from "@/lib/methodology/page-content";

export function MethodologyRecruitmentRulesSection() {
  return (
    <section
      id="methodology-recruitment-rules"
      aria-labelledby="methodology-recruitment-rules-heading"
      className="methodology-panel methodology-scroll-target"
    >
      <h2
        id="methodology-recruitment-rules-heading"
        className="text-lg font-semibold text-text-primary"
      >
        Suggested recruitment attention
      </h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
        {METHODOLOGY_RECRUITMENT_RULES_INTRO}
      </p>

      <div className="mt-4 space-y-4">
        <div className="methodology-rules-card">
          <h3 className="methodology-rules-card__title">
            {METHODOLOGY_RECRUITMENT_COMPARISON_REQUIREMENTS.title}
          </h3>
          <ul className="methodology-rules-card__list">
            {METHODOLOGY_RECRUITMENT_COMPARISON_REQUIREMENTS.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <p className="methodology-rules-card__note">
            {METHODOLOGY_RECRUITMENT_COMPARISON_REQUIREMENTS.explanation}
          </p>
        </div>

        <div className="methodology-rules-card">
          <h3 className="methodology-rules-card__title">Indicators used</h3>
          <ul className="methodology-rules-card__list">
            {METHODOLOGY_RECRUITMENT_INDICATORS.map((indicator) => (
              <li key={indicator}>{indicator}</li>
            ))}
          </ul>
        </div>

        <div className="methodology-callout">{METHODOLOGY_HIGHEST_QUARTER_CALLOUT}</div>

        <div className="methodology-table-wrap">
          <table className="methodology-table">
            <thead>
              <tr>
                <th scope="col">Level</th>
                <th scope="col">Plain-language rule</th>
              </tr>
            </thead>
            <tbody>
              {METHODOLOGY_RECRUITMENT_LEVELS.map((row) => (
                <tr key={row.level}>
                  <th scope="row">{row.level}</th>
                  <td>{row.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
