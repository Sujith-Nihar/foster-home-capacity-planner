"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "p" | "h1" | "h2";
  delayClassName?: string;
  immediate?: boolean;
  id?: string;
};

function prepareAnimatedReveal(node: HTMLElement) {
  node.classList.remove("fi-text-reveal--visible");
  node.classList.add("fi-text-reveal--enhanced");
}

function revealImmediately(node: HTMLElement) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    node.classList.add("fi-text-reveal--visible");
    return;
  }

  prepareAnimatedReveal(node);

  window.requestAnimationFrame(() => {
    node.classList.add("fi-text-reveal--visible");
  });
}

export function TextReveal({
  children,
  className,
  as: Component = "div",
  delayClassName,
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
      node.classList.add("fi-text-reveal--visible");
      return;
    }

    if (immediate) {
      revealImmediately(node);
      return;
    }

    const rect = node.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    prepareAnimatedReveal(node);

    if (inView) {
      window.requestAnimationFrame(() => {
        node.classList.add("fi-text-reveal--visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.classList.add("fi-text-reveal--visible");
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
      className={cn("fi-text-reveal fi-text-reveal--visible", delayClassName, className)}
    >
      {children}
    </Component>
  );
}
