import type { DatasetMetadataDto } from "@/lib/types/domain";
import { METHODOLOGY_SCROLL_MARGIN_CLASS } from "@/lib/methodology/page-content";
import { formatCount, formatReportingDate } from "@/lib/utils/formatters";

type MethodologyDataSnapshotProps = {
  metadata: DatasetMetadataDto;
};

export function MethodologyDataSnapshot({ metadata }: MethodologyDataSnapshotProps) {
  return (
    <section
      id="methodology-data-snapshot"
      aria-labelledby="methodology-data-snapshot-heading"
      className={`methodology-panel ${METHODOLOGY_SCROLL_MARGIN_CLASS}`}
    >
      <h2 id="methodology-data-snapshot-heading" className="text-lg font-semibold text-text-primary">
        Data snapshot
      </h2>

      <dl className="methodology-data-snapshot__grid">
        <div className="methodology-data-snapshot__field">
          <dt>Reporting date</dt>
          <dd>
            <time dateTime={metadata.reportingDate}>
              {formatReportingDate(metadata.reportingDate)}
            </time>
          </dd>
        </div>
        <div className="methodology-data-snapshot__field">
          <dt>Dataset version</dt>
          <dd>{metadata.datasetVersion}</dd>
        </div>
        <div className="methodology-data-snapshot__field methodology-data-snapshot__field--wide">
          <dt>Source records processed</dt>
          <dd>
            <ul className="methodology-data-snapshot__records">
              <li>{formatCount(metadata.providerCount)} provider records</li>
              <li>{formatCount(metadata.childCount)} child records</li>
              <li>{formatCount(metadata.placementCount)} placement records</li>
            </ul>
          </dd>
        </div>
      </dl>

      <p className="methodology-data-snapshot__note text-sm leading-6 text-text-secondary">
        These are source-file record counts, not the number of children currently in care or
        providers currently licensed.{" "}
        <a href="#methodology-technical-details" className="methodology-inline-link">
          View build metadata
        </a>
      </p>
    </section>
  );
}
