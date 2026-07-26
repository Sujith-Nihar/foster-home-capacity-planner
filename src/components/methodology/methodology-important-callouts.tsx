import {
  IMPORTANT_THINGS_TO_KNOW,
  METHODOLOGY_SCROLL_MARGIN_CLASS,
} from "@/lib/methodology/page-content";

export function MethodologyImportantCallouts() {
  return (
    <section
      id="methodology-important-things"
      aria-labelledby="methodology-important-things-heading"
      className={`${METHODOLOGY_SCROLL_MARGIN_CLASS} space-y-4`}
    >
      <h2 id="methodology-important-things-heading" className="text-lg font-semibold text-text-primary">
        Important things to know
      </h2>
      <ul className="methodology-important-grid">
        {IMPORTANT_THINGS_TO_KNOW.map((statement) => (
          <li key={statement} className="methodology-important-callout">
            {statement}
          </li>
        ))}
      </ul>
    </section>
  );
}
