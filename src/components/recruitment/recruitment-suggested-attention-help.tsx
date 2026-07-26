"use client";

import Link from "next/link";
import { Info } from "lucide-react";

import { RecruitmentAttentionInfoPopover } from "@/components/recruitment/recruitment-attention-info-popover";
import {
  RECRUITMENT_ATTENTION_CLASSIFICATIONS,
  RECRUITMENT_PLANNING_CAVEAT,
} from "@/content/methodology";

const LIMITED_DATA_DESCRIPTION =
  "The county does not meet the minimum child or engaged-provider counts required for stable comparison.";

export function RecruitmentSuggestedAttentionHelp() {
  return (
    <RecruitmentAttentionInfoPopover
      allowPopupHover
      trigger={
        <span className="inline-flex size-5 items-center justify-center rounded-full text-text-tertiary hover:text-brand-navy">
          <Info className="size-3.5" aria-hidden="true" />
        </span>
      }
      triggerLabel="How suggested recruitment attention is calculated"
      side="bottom"
    >
      <p className="font-medium text-text-primary">Suggested recruitment attention</p>
      <dl className="mt-2 space-y-2">
        {RECRUITMENT_ATTENTION_CLASSIFICATIONS.map((item) => (
          <div key={item.level}>
            <dt className="font-medium text-text-primary">{item.level}:</dt>
            <dd>{item.description}</dd>
          </div>
        ))}
        <div>
          <dt className="font-medium text-text-primary">Limited data:</dt>
          <dd>{LIMITED_DATA_DESCRIPTION}</dd>
        </div>
      </dl>
      <p className="mt-3 text-text-secondary">{RECRUITMENT_PLANNING_CAVEAT}</p>
      <Link
        href="/methodology#prototype-planning-rules"
        className="mt-3 inline-flex font-medium text-brand-navy underline-offset-4 hover:underline"
      >
        View full methodology
      </Link>
    </RecruitmentAttentionInfoPopover>
  );
}
