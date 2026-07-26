import {
  METHODOLOGY_LIMITATION_GROUPS,
  METHODOLOGY_LIMITATIONS_INTRO,
} from "@/lib/methodology/page-content";

export function MethodologyLimitationsSection() {
  return (
    <section
      id="methodology-limitations"
      aria-labelledby="methodology-limitations-heading"
      className="methodology-panel methodology-scroll-target"
    >
      <h2 id="methodology-limitations-heading" className="text-lg font-semibold text-text-primary">
        Limitations and appropriate use
      </h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
        {METHODOLOGY_LIMITATIONS_INTRO}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {METHODOLOGY_LIMITATION_GROUPS.map((group) => (
          <div key={group.title} className="methodology-rules-card">
            <h3 className="methodology-rules-card__title">{group.title}</h3>
            <ul className="methodology-rules-card__list">
              {group.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
