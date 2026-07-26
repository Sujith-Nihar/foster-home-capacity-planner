"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type AccessibleInfoPopoverProps = {
  triggerContent: ReactNode;
  triggerLabel: string;
  children: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  side?: "top" | "bottom" | "left" | "right";
  allowPopupHover?: boolean;
};

export function AccessibleInfoPopover({
  triggerContent,
  triggerLabel,
  children,
  triggerClassName,
  contentClassName,
  side = "top",
  allowPopupHover = false,
}: AccessibleInfoPopoverProps) {
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
              "inline-flex max-w-full min-w-0 items-center border-0 bg-transparent p-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              triggerClassName,
            )}
          />
        }
      >
        {triggerContent}
      </TooltipTrigger>
      <TooltipContent
        id={contentId}
        side={side}
        align="start"
        className={cn(
          "accessible-info-popover w-[min(22.5rem,calc(100vw-2rem))] max-w-[min(22.5rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-surface-raised px-3 py-2.5 text-left text-xs leading-5 text-text-secondary shadow-md",
          contentClassName,
        )}
      >
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
