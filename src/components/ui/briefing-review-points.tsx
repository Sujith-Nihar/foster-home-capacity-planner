type BriefingReviewPointsProps = {
  title: string;
  titleId: string;
  points: string[];
};

export function BriefingReviewPoints({ title, titleId, points }: BriefingReviewPointsProps) {
  return (
    <section
      aria-labelledby={titleId}
      className="rounded-2xl border border-border-subtle bg-warm-surface p-5 sm:p-6"
    >
      <h2 id={titleId} className="text-lg font-semibold text-text-primary">
        {title}
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-primary">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
}

export function splitBriefingSummary(summary: string): string[] {
  return summary
    .split(/(?<=\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}
