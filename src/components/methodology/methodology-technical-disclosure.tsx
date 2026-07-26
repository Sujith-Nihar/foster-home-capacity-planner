"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import type { DatasetMetadataDto } from "@/lib/types/domain";
import { buildTechnicalDetailsContent } from "@/lib/methodology/page-content";
import { formatReportingDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

type MethodologyTechnicalDisclosureProps = {
  metadata: DatasetMetadataDto;
};

function formatGeneratedAt(value: string): string {
  return format(parseISO(value), "MMMM d, yyyy 'at' h:mm a");
}

function TechnicalSubsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="methodology-technical-subsection">
      <h3 className="methodology-technical-subsection__title">{title}</h3>
      {children}
    </div>
  );
}

export function MethodologyTechnicalDisclosure({ metadata }: MethodologyTechnicalDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const technical = buildTechnicalDetailsContent();

  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
    requestAnimationFrame(() => {
      toggleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <section
      id="methodology-technical-details"
      aria-labelledby="methodology-technical-details-heading"
      className="methodology-panel methodology-scroll-target"
    >
      <h2
        id="methodology-technical-details-heading"
        className="text-lg font-semibold text-text-primary"
      >
        Technical details and data lineage
      </h2>

      <div className="methodology-technical-disclosure">
        <button
          ref={toggleRef}
          type="button"
          className="methodology-technical-disclosure__toggle"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={handleToggle}
        >
          <span>Show technical details and data lineage</span>
          <ChevronDown
            className={cn(
              "methodology-technical-disclosure__chevron",
              isOpen && "methodology-technical-disclosure__chevron--expanded",
            )}
            aria-hidden="true"
          />
        </button>

        <div id={panelId} hidden={!isOpen} className="methodology-technical-disclosure__panel">
          {isOpen ? (
            <div className="space-y-5">
              <TechnicalSubsection title="Build metadata">
                <dl className="methodology-technical-metadata">
                  <div>
                    <dt>Reporting date</dt>
                    <dd>
                      <time dateTime={metadata.reportingDate}>
                        {formatReportingDate(metadata.reportingDate)}
                      </time>
                    </dd>
                  </div>
                  <div>
                    <dt>Generated at</dt>
                    <dd>
                      <time dateTime={metadata.generatedAt}>
                        {formatGeneratedAt(metadata.generatedAt)}
                      </time>
                    </dd>
                  </div>
                  <div>
                    <dt>ETL version</dt>
                    <dd>{metadata.etlVersion}</dd>
                  </div>
                  <div>
                    <dt>Dataset version</dt>
                    <dd>{metadata.datasetVersion}</dd>
                  </div>
                  <div className="methodology-technical-metadata__hash">
                    <dt>Source hash</dt>
                    <dd>
                      <code className="methodology-source-hash">{metadata.sourceHash}</code>
                    </dd>
                  </div>
                </dl>
                <ul className="methodology-technical-list">
                  {technical.buildMetadata.map((item) => (
                    <li key={item.label}>
                      <span className="font-medium text-text-primary">{item.label}: </span>
                      {item.description}
                    </li>
                  ))}
                </ul>
              </TechnicalSubsection>

              <TechnicalSubsection title="Date and interval rules">
                <ul className="methodology-technical-list">
                  {technical.dateIntervalRules.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </TechnicalSubsection>

              <TechnicalSubsection title="Normalization rules">
                <ul className="methodology-technical-list">
                  {technical.normalizationRules.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </TechnicalSubsection>

              <TechnicalSubsection title="Privacy-preserving aggregation">
                <ul className="methodology-technical-list">
                  {technical.privacyAggregation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </TechnicalSubsection>

              <TechnicalSubsection title="Raw formulas">
                <ul className="methodology-technical-list methodology-technical-list--mono">
                  {technical.rawFormulas.map((item) => (
                    <li key={item}>
                      <code>{item}</code>
                    </li>
                  ))}
                </ul>
              </TechnicalSubsection>

              <TechnicalSubsection title="Implementation notes">
                <ul className="methodology-technical-list">
                  {[...technical.implementationNotes, ...technical.retainedLimitations].map(
                    (item) => (
                      <li key={item}>{item}</li>
                    ),
                  )}
                </ul>
              </TechnicalSubsection>

              <TechnicalSubsection title="Planning policy notes">
                <ul className="methodology-technical-list">
                  {technical.planningPolicyNotes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </TechnicalSubsection>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
