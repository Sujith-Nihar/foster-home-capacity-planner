import { Info } from "lucide-react";

import type { MethodologySection } from "@/lib/methodology/sections";
import { METHODOLOGY_CALLOUTS } from "@/lib/methodology/sections";
import type { DatasetMetadataDto } from "@/lib/types/domain";
import { formatCount, formatReportingDate } from "@/lib/utils/formatters";
import { format, parseISO } from "date-fns";

type MethodologySectionCardProps = {
  section: MethodologySection;
};

function MethodologySectionCard({ section }: MethodologySectionCardProps) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="scroll-mt-24 space-y-3 rounded-lg border border-border-default bg-surface-raised p-6"
    >
      <h2 id={`${section.id}-heading`} className="text-lg font-semibold text-text-primary">
        {section.title}
      </h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-6 text-text-secondary">
          {paragraph}
        </p>
      ))}
      {section.bullets && section.bullets.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-text-secondary">
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

type MethodologyPageContentProps = {
  metadata: DatasetMetadataDto;
  sections: MethodologySection[];
};

function formatGeneratedAt(value: string): string {
  return format(parseISO(value), "MMMM d, yyyy 'at' h:mm a");
}

export function MethodologyPageContent({ metadata, sections }: MethodologyPageContentProps) {
  return (
    <div className="space-y-8">
      <section
        aria-labelledby="methodology-principles-heading"
        className="space-y-4 rounded-lg border border-border-default bg-surface-raised p-6"
      >
        <h2 id="methodology-principles-heading" className="text-lg font-semibold text-text-primary">
          How to read this application
        </h2>
        <ul className="space-y-3">
          {METHODOLOGY_CALLOUTS.map((callout) => (
            <li
              key={callout}
              className="flex items-start gap-3 text-sm leading-6 text-text-secondary"
            >
              <Info className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
              <span>{callout}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="dataset-version-heading"
        className="space-y-4 rounded-lg border border-border-default bg-surface-raised p-6"
      >
        <h2 id="dataset-version-heading" className="text-lg font-semibold text-text-primary">
          Data version
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-text-primary">Dataset version</dt>
            <dd className="mt-1 text-sm text-text-secondary">{metadata.datasetVersion}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-primary">Reporting date</dt>
            <dd className="mt-1 text-sm text-text-secondary">
              <time dateTime={metadata.reportingDate}>
                {formatReportingDate(metadata.reportingDate)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-primary">Generated at</dt>
            <dd className="mt-1 text-sm text-text-secondary">
              <time dateTime={metadata.generatedAt}>{formatGeneratedAt(metadata.generatedAt)}</time>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-primary">ETL version</dt>
            <dd className="mt-1 text-sm text-text-secondary">{metadata.etlVersion}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-primary">Source hash</dt>
            <dd className="mt-1 break-all font-mono text-xs text-text-secondary">
              {metadata.sourceHash}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-primary">Published record counts</dt>
            <dd className="mt-1 text-sm text-text-secondary">
              {formatCount(metadata.providerCount)} providers · {formatCount(metadata.childCount)}{" "}
              children · {formatCount(metadata.placementCount)} placements
            </dd>
          </div>
        </dl>
      </section>

      <nav aria-label="Methodology sections" className="rounded-lg border border-border-default p-4">
        <h2 className="text-sm font-medium text-text-primary">On this page</h2>
        <ul className="mt-3 columns-1 gap-x-8 space-y-2 text-sm sm:columns-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-accent-brand underline-offset-4 hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        {sections.map((section) => (
          <MethodologySectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
