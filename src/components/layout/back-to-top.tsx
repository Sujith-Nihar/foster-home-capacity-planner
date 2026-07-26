"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 600;

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY >= SCROLL_THRESHOLD_PX);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = useCallback(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Back to top"
              tabIndex={isVisible ? 0 : -1}
              onClick={handleClick}
              className={cn(
                "back-to-top",
                !isVisible && "back-to-top--hidden",
              )}
            />
          }
        >
          <ArrowUp aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side="left">Back to top</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
