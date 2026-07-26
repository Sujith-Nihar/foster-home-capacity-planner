"use client";

import type { ReactNode } from "react";

import { AccessibleInfoPopover } from "@/components/shared/accessible-info-popover";

type RecruitmentAttentionInfoPopoverProps = {
  trigger: ReactNode;
  triggerLabel: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  side?: "top" | "bottom" | "left" | "right";
  allowPopupHover?: boolean;
};

export function RecruitmentAttentionInfoPopover({
  trigger,
  triggerLabel,
  children,
  className,
  contentClassName,
  side = "top",
  allowPopupHover = false,
}: RecruitmentAttentionInfoPopoverProps) {
  return (
    <AccessibleInfoPopover
      triggerContent={trigger}
      triggerLabel={triggerLabel}
      triggerClassName={className}
      contentClassName={contentClassName ? `recruitment-attention-popover ${contentClassName}` : "recruitment-attention-popover"}
      side={side}
      allowPopupHover={allowPopupHover}
    >
      {children}
    </AccessibleInfoPopover>
  );
}
