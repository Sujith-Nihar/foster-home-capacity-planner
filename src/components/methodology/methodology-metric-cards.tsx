import type { MethodologyMetricCard } from "@/lib/methodology/page-content";

type MethodologyMetricCardsProps = {
  metrics: MethodologyMetricCard[];
};

function MethodologyMetricCardItem({ metric }: { metric: MethodologyMetricCard }) {
  return (
    <article className="methodology-metric-card">
      <h3 className="methodology-metric-card__title">{metric.title}</h3>
      <dl className="methodology-metric-card__fields">
        <div>
          <dt>What it means</dt>
          <dd>{metric.whatItMeans}</dd>
        </div>
        <div>
          <dt>Why it is useful</dt>
          <dd>{metric.whyUseful}</dd>
        </div>
        <div>
          <dt>How it is calculated</dt>
          <dd className="methodology-formula">{metric.howCalculated}</dd>
        </div>
        <div>
          <dt>Important limitation</dt>
          <dd>{metric.limitation}</dd>
        </div>
      </dl>
    </article>
  );
}

export function MethodologyMetricCards({ metrics }: MethodologyMetricCardsProps) {
  return (
    <div className="methodology-metric-grid">
      {metrics.map((metric) => (
        <MethodologyMetricCardItem key={metric.title} metric={metric} />
      ))}
    </div>
  );
}
