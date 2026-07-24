"use client";

import type { ReactNode } from "react";

import { PriorityBadge, priorityToAttentionLevel } from "@/components/priority-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CountyMetricsDto } from "@/lib/types/domain";
import { formatRecruitmentPriorityLabel } from "@/lib/utils/formatters";

type PriorityBadgeWithReasonsProps = {
  county: CountyMetricsDto;
};

export function PriorityBadgeWithReasons({ county }: PriorityBadgeWithReasonsProps) {
  const badge = (
    <PriorityBadge
      level={priorityToAttentionLevel(county.recruitmentPriority)}
      label={formatRecruitmentPriorityLabel(county.recruitmentPriority)}
    />
  );

  if (county.recruitmentReasons.length === 0) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex max-w-full" />}>{badge}</TooltipTrigger>
      <TooltipContent className="max-w-sm text-left">
        <p className="font-medium">Recruitment reasons</p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          {county.recruitmentReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

type PriorityBadgeWithReasonsProviderProps = {
  children: ReactNode;
};

export function PriorityBadgeWithReasonsProvider({
  children,
}: PriorityBadgeWithReasonsProviderProps) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
