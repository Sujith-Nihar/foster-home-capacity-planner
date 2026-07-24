"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "p" | "h1" | "h2";
  delayMs?: number;
  immediate?: boolean;
  id?: string;
};

export function TextReveal({
  children,
  className,
  as: Component = "div",
  delayMs = 0,
  immediate = false,
  id,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      node.classList.add("text-reveal--visible");
      return;
    }

    if (immediate) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        node.classList.add("text-reveal--visible");
        return;
      }

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          node.classList.add("text-reveal--enhanced");
          window.requestAnimationFrame(() => {
            node.classList.add("text-reveal--visible");
          });
        });
      });
      return;
    }

    const rect = node.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (inView) {
      node.classList.add("text-reveal--enhanced", "text-reveal--visible");
      return;
    }

    node.classList.add("text-reveal--enhanced");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.classList.add("text-reveal--visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [immediate]);

  return (
    <Component
      ref={ref as never}
      id={id}
      className={cn("text-reveal", className)}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
