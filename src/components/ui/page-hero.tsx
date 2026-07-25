import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type HeroAction = {
  label: string;
  href: string;
};

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  headline?: string;
  description?: string;
  actions?: HeroAction[];
  aside?: ReactNode;
  variant?: "executive" | "compact";
  className?: string;
};

export function PageHero({
  title,
  eyebrow,
  headline,
  description,
  actions,
  aside,
  variant = "executive",
  className,
}: PageHeroProps) {
  const isExecutive = variant === "executive";

  if (isExecutive) {
    return (
      <section className={cn("overview-hero px-6 py-14 sm:px-8 lg:px-10 lg:py-16", className)}>
        <h1 className="sr-only">{title}</h1>
        <div
          className={cn(
            "relative z-10 grid gap-6 lg:gap-8",
            aside ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center" : "",
          )}
        >
          <div className="space-y-4">
            {eyebrow ? <p className="hero-eyebrow">{eyebrow}</p> : null}
            {headline ? <p className="hero-headline">{headline}</p> : null}
            {description ? <p className="hero-description">{description}</p> : null}
            {actions && actions.length > 0 ? (
              <div className="flex flex-wrap gap-3 pt-1">
                {actions.map((action, index) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={cn(
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07152f]",
                      index === 0 ? "hero-action-primary" : "hero-action-secondary",
                    )}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          {aside ? <div className="relative z-10 min-w-0">{aside}</div> : null}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--radius-hero)] border border-border-subtle bg-surface-raised px-6 py-6 sm:px-8",
        className,
      )}
    >
      <div
        className={cn(
          "relative grid gap-6",
          aside ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end" : "",
        )}
      >
        <div className="space-y-3">
          <h1 className="text-2xl font-medium tracking-tight text-foreground">{title}</h1>
          {eyebrow ? <p className="eyebrow-label">{eyebrow}</p> : null}
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
          {actions && actions.length > 0 ? (
            <div className="flex flex-wrap gap-3 pt-1">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex h-10 items-center rounded-full bg-accent-brand px-4 text-sm font-medium text-accent-brand-foreground transition-colors hover:bg-accent-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}
