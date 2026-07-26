"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const contentId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <Tooltip open={open} onOpenChange={setOpen} disableHoverablePopup={!allowPopupHover}>
      <TooltipTrigger
        closeOnClick={false}
        delay={0}
        render={
          <button
            type="button"
            aria-label={triggerLabel}
            aria-expanded={open}
            aria-controls={contentId}
            onPointerDown={(event) => {
              if (event.pointerType === "touch") {
                event.preventDefault();
                setOpen((current) => !current);
              }
            }}
            className={cn(
              "inline-flex max-w-full shrink-0 items-center border-0 bg-transparent p-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className,
            )}
          />
        }
      >
        {trigger}
      </TooltipTrigger>
      <TooltipContent
        id={contentId}
        side={side}
        align="start"
        className={cn(
          "recruitment-attention-popover w-[min(20rem,calc(100vw-2rem))] max-w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-surface-raised px-3 py-2.5 text-left text-xs leading-5 text-text-secondary shadow-md",
          contentClassName,
        )}
      >
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
