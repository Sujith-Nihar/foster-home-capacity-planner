import { formatCount } from "@/lib/utils/formatters";

type OperationalResultCountProps = {
  totalCount: number;
  noun: string;
  nounPlural: string;
  className?: string;
};

export function OperationalResultCount({
  totalCount,
  noun,
  nounPlural,
  className,
}: OperationalResultCountProps) {
  const resultLabel = totalCount === 1 ? noun : nounPlural;
  const matchLabel = totalCount === 1 ? "matches" : "match";

  return (
    <p
      className={className ?? "operational-filter-result-count"}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {totalCount === 0 ? (
        <>No {nounPlural} match</>
      ) : (
        <>
          <span className="operational-filter-result-count__value">{formatCount(totalCount)}</span>{" "}
          {resultLabel} {matchLabel}
        </>
      )}
    </p>
  );
}
