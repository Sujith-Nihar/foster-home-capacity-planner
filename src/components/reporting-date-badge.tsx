import { CalendarDays } from "lucide-react";

import { REPORTING_DATE } from "@/config/metrics";
import { formatReportingDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

type ReportingDateBadgeProps = {
  reportingDate?: string;
  className?: string;
};

export function ReportingDateBadge({
  reportingDate = REPORTING_DATE,
  className,
}: ReportingDateBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm text-text-secondary",
        className,
      )}
    >
      <CalendarDays className="size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
      <span>
        Reporting date:{" "}
        <time dateTime={reportingDate} className="font-semibold tabular-nums text-text-primary">
          {formatReportingDate(reportingDate)}
        </time>
      </span>
    </span>
  );
}
