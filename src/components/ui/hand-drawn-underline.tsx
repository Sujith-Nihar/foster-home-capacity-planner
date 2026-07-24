"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type HandDrawnUnderlineProps = {
  className?: string;
  tone?: "navy" | "sky";
};

export function HandDrawnUnderline({ className, tone = "navy" }: HandDrawnUnderlineProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = prefersReducedMotion ? "0" : `${length}`;

    if (prefersReducedMotion) {
      path.classList.add("hand-drawn-underline-path--drawn");
      return;
    }

    const timer = window.setTimeout(() => {
      path.classList.add("hand-drawn-underline-path--drawn");
      path.style.strokeDashoffset = "0";
    }, 380);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <svg
      className={cn(
        "pointer-events-none absolute -bottom-1 left-0 w-full text-brand-navy",
        tone === "sky" && "text-brand-blue",
        className,
      )}
      viewBox="0 0 220 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        ref={pathRef}
        d="M3 6.5C34 2.8 58 8.2 92 5.6C118 3.8 146 7.4 174 4.9C192 3.4 206 6.1 217 5.2"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        className="hand-drawn-underline-path"
      />
    </svg>
  );
}
