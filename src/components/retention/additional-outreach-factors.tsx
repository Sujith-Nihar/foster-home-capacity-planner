"use client";

import { useId } from "react";

import { AccessibleInfoPopover } from "@/components/shared/accessible-info-popover";
import { formatAdditionalFactorCount } from "@/lib/utils/pluralization";

type AdditionalOutreachFactorsProps = {
  reasons: string[];
};

function formatAdditionalFactorsLabel(count: number): string {
  return formatAdditionalFactorCount(count);
}

export function AdditionalOutreachFactors({ reasons }: AdditionalOutreachFactorsProps) {
  const listId = useId();
  const label = formatAdditionalFactorsLabel(reasons.length);

  if (reasons.length === 0) {
    return null;
  }

  return (
    <AccessibleInfoPopover
      triggerContent={label}
      triggerLabel={`${label}. Show additional outreach factors.`}
      triggerClassName="mt-0.5 text-xs font-medium text-brand-navy underline-offset-2 hover:underline"
      contentClassName="additional-outreach-factors-popover"
      side="top"
      allowPopupHover
    >
      <div className="additional-outreach-factors-popover__content">
        <p className="additional-outreach-factors-popover__title">Additional factors</p>
        <ul id={listId} className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-text-secondary">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
    </AccessibleInfoPopover>
  );
}
