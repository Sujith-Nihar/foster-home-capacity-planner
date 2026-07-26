import { MethodologyCoreDefinitions } from "@/components/methodology/methodology-core-definitions";
import { MethodologyDataSnapshot } from "@/components/methodology/methodology-data-snapshot";
import { MethodologyImportantCallouts } from "@/components/methodology/methodology-important-callouts";
import { MethodologyLimitationsSection } from "@/components/methodology/methodology-limitations-section";
import { MethodologyMetricCards } from "@/components/methodology/methodology-metric-cards";
import { MethodologyRecruitmentRulesSection } from "@/components/methodology/methodology-recruitment-rules-section";
import { MethodologyRetentionRulesSection } from "@/components/methodology/methodology-retention-rules-section";
import { MethodologySectionNav } from "@/components/methodology/methodology-section-nav";
import { MethodologyTechnicalDisclosure } from "@/components/methodology/methodology-technical-disclosure";
import { SectionReveal } from "@/components/ui/section-reveal";
import {
  METHODOLOGY_CORE_DEFINITIONS,
  METHODOLOGY_RECRUITMENT_METRICS,
  METHODOLOGY_RECRUITMENT_METRICS_NOTE,
  METHODOLOGY_RETENTION_METRICS,
  METHODOLOGY_RETENTION_METRICS_NOTE,
  METHODOLOGY_SCROLL_MARGIN_CLASS,
} from "@/lib/methodology/page-content";
import type { DatasetMetadataDto } from "@/lib/types/domain";

type MethodologyPageContentProps = {
  metadata: DatasetMetadataDto;
};

export function MethodologyPageContent({ metadata }: MethodologyPageContentProps) {
  return (
    <div className="methodology-page space-y-6">
      <SectionReveal>
        <MethodologyImportantCallouts />
      </SectionReveal>

      <SectionReveal delayMs={20}>
        <MethodologySectionNav />
      </SectionReveal>

      <SectionReveal delayMs={40}>
        <MethodologyDataSnapshot metadata={metadata} />
      </SectionReveal>

      <SectionReveal delayMs={60}>
        <MethodologyCoreDefinitions groups={METHODOLOGY_CORE_DEFINITIONS} />
      </SectionReveal>

      <SectionReveal delayMs={80}>
        <section
          id="methodology-recruitment-metrics"
          aria-labelledby="methodology-recruitment-metrics-heading"
          className={`methodology-panel ${METHODOLOGY_SCROLL_MARGIN_CLASS}`}
        >
          <h2
            id="methodology-recruitment-metrics-heading"
            className="text-lg font-semibold text-text-primary"
          >
            Recruitment metrics
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
            County-level indicators used for recruitment planning review.
          </p>
          <div className="mt-4 space-y-4">
            <MethodologyMetricCards metrics={METHODOLOGY_RECRUITMENT_METRICS} />
            <p className="max-w-3xl text-sm leading-6 text-text-secondary">
              {METHODOLOGY_RECRUITMENT_METRICS_NOTE}
            </p>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delayMs={100}>
        <section
          id="methodology-retention-metrics"
          aria-labelledby="methodology-retention-metrics-heading"
          className={`methodology-panel ${METHODOLOGY_SCROLL_MARGIN_CLASS}`}
        >
          <h2
            id="methodology-retention-metrics-heading"
            className="text-lg font-semibold text-text-primary"
          >
            Retention metrics
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
            Provider-level placement, license and activity measures used for outreach review.
          </p>
          <div className="mt-4 space-y-4">
            <MethodologyMetricCards metrics={METHODOLOGY_RETENTION_METRICS} />
            <p className="max-w-3xl text-sm leading-6 text-text-secondary">
              {METHODOLOGY_RETENTION_METRICS_NOTE}
            </p>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delayMs={120}>
        <MethodologyRecruitmentRulesSection />
      </SectionReveal>

      <SectionReveal delayMs={140}>
        <MethodologyRetentionRulesSection />
      </SectionReveal>

      <SectionReveal delayMs={160}>
        <MethodologyLimitationsSection />
      </SectionReveal>

      <SectionReveal delayMs={180}>
        <MethodologyTechnicalDisclosure metadata={metadata} />
      </SectionReveal>
    </div>
  );
}
