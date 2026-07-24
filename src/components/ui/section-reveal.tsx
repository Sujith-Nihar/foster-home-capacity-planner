"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  delayClassName?: string;
  delayMs?: number;
};

function isInViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

export function SectionReveal({
  children,
  className,
  delayClassName,
  delayMs = 0,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      node.classList.add("fi-section-reveal--visible");
      return;
    }

    node.classList.add("fi-section-reveal--enhanced");
    node.classList.remove("fi-section-reveal--visible");

    const reveal = () => {
      node.classList.add("fi-section-reveal--visible");
      observer.disconnect();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(node);

    window.requestAnimationFrame(() => {
      if (isInViewport(node)) {
        reveal();
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("fi-section-reveal fi-section-reveal--visible", delayClassName, className)}
      style={!delayClassName && delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
