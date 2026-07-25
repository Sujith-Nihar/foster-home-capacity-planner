"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TextRevealVariant = "default" | "eyebrow" | "heading" | "description" | "action";

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "p" | "h1" | "h2";
  variant?: TextRevealVariant;
  delayClassName?: string;
  immediate?: boolean;
  id?: string;
};

const VARIANT_CLASSES: Record<Exclude<TextRevealVariant, "default">, string> = {
  eyebrow: "page-intro-eyebrow-reveal fi-reveal-delay-eyebrow",
  heading: "page-intro-headline-reveal fi-reveal-delay-heading",
  description: "page-intro-description-reveal fi-reveal-delay-description",
  action: "page-intro-actions-reveal fi-reveal-delay-actions",
};

function prepareAnimatedReveal(node: HTMLElement) {
  node.classList.remove("fi-text-reveal--visible");
  node.classList.add("fi-text-reveal--enhanced");
}

function revealNode(node: HTMLElement) {
  window.requestAnimationFrame(() => {
    node.classList.add("fi-text-reveal--visible");
  });
}

export function TextReveal({
  children,
  className,
  as: Component = "div",
  variant = "default",
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
      prepareAnimatedReveal(node);
      revealNode(node);
      return;
    }

    const rect = node.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    prepareAnimatedReveal(node);

    if (inView) {
      revealNode(node);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          revealNode(node);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [immediate]);

  const variantClass =
    variant !== "default" ? VARIANT_CLASSES[variant] : undefined;

  return (
    <Component
      ref={ref as never}
      id={id}
      className={cn(
        "fi-text-reveal fi-text-reveal--visible",
        variantClass,
        delayClassName,
        className,
      )}
    >
      {children}
    </Component>
  );
}
