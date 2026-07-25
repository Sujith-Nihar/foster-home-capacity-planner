"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { MOTION_DELAY_MS } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type HandDrawnUnderlineProps = {
  className?: string;
  tone?: "navy" | "sky";
};

let activePathname: string | null = null;
const drawnPathnames = new Set<string>();

function beginPathnameVisit(pathname: string) {
  const visitedDifferentRoute = activePathname !== null && activePathname !== pathname;
  if (visitedDifferentRoute) {
    drawnPathnames.delete(pathname);
  }
  activePathname = pathname;
}

function shouldSkipUnderlineAnimation(pathname: string) {
  return activePathname === pathname && drawnPathnames.has(pathname);
}

function markUnderlineDrawn(pathname: string) {
  drawnPathnames.add(pathname);
}

export function HandDrawnUnderline({ className, tone = "navy" }: HandDrawnUnderlineProps) {
  const pathname = usePathname();
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) {
      return;
    }

    beginPathnameVisit(pathname);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldSkipUnderlineAnimation(pathname)) {
      path.classList.add("hand-drawn-underline-path--drawn");
      return;
    }

    path.classList.remove("hand-drawn-underline-path--drawn");

    if (prefersReducedMotion) {
      path.classList.add("hand-drawn-underline-path--drawn");
      markUnderlineDrawn(pathname);
      return;
    }

    let frame2 = 0;
    let drawTimeout = 0;

    const frame1 = window.requestAnimationFrame(() => {
      frame2 = window.requestAnimationFrame(() => {
        drawTimeout = window.setTimeout(() => {
          path.classList.add("hand-drawn-underline-path--drawn");
          markUnderlineDrawn(pathname);
        }, MOTION_DELAY_MS.underline);
      });
    });

    return () => {
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
      window.clearTimeout(drawTimeout);
    };
  }, [pathname]);

  return (
    <svg
      className={cn(
        "pointer-events-none absolute -bottom-1 left-0 h-2.5 w-full text-brand-navy",
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
        pathLength={1}
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset="1"
        fill="none"
        className="hand-drawn-underline-path"
      />
    </svg>
  );
}
