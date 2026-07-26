"use client";

import { Info } from "lucide-react";

import { RecruitmentAttentionInfoPopover } from "@/components/recruitment/recruitment-attention-info-popover";

export function TopQuarterBenchmarkTooltip() {
  return (
    <RecruitmentAttentionInfoPopover
      trigger={
        <span className="inline-flex items-center gap-1 text-text-secondary">
          <Info className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="sr-only">Top-quarter benchmark explanation</span>
        </span>
      }
      triggerLabel="Top-quarter benchmark. Show explanation."
      contentClassName="top-quarter-benchmark-popover"
      side="top"
    >
      <div className="top-quarter-benchmark-tooltip">
        <p className="top-quarter-benchmark-tooltip__title">Top-quarter benchmark</p>
        <p className="top-quarter-benchmark-tooltip__body">
          A county at or above this value has higher age-group pressure than about 75% of comparable
          counties.
        </p>
      </div>
    </RecruitmentAttentionInfoPopover>
  );
}
