import type { ReactNode } from "react";
import Link from "next/link";

import { HandDrawnUnderline } from "@/components/ui/hand-drawn-underline";
import { cn } from "@/lib/utils";

type PageIntroductionAction = {
  label: string;
  href: string;
};

type PageIntroductionProps = {
  title: string;
  eyebrow: string;
  headline?: string;
  highlightPhrase?: string;
  description?: string;
  actions?: PageIntroductionAction[];
  aside?: ReactNode;
  className?: string;
};

export function PageIntroduction({
  title,
  eyebrow,
  headline,
  highlightPhrase,
  description,
  actions,
  aside,
  className,
}: PageIntroductionProps) {
  const displayHeadline = headline ?? title;

  function renderHeadline() {
    if (!highlightPhrase || !displayHeadline.includes(highlightPhrase)) {
      return displayHeadline;
    }

    const [before, after] = displayHeadline.split(highlightPhrase);

    return (
      <>
        {before}
        <span className="relative inline-block text-brand-navy">
          {highlightPhrase}
          <HandDrawnUnderline />
        </span>
        {after}
      </>
    );
  }

  return (
    <section className={cn("page-intro section-enter", className)} aria-labelledby="page-intro-title">
      <div
        className={cn(
          "grid w-full gap-6",
          aside ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center" : "",
        )}
      >
        <div className="space-y-3">
          <p className="eyebrow-label">{eyebrow}</p>
          <h1
            id="page-intro-title"
            className="text-lg font-medium tracking-tight text-brand-navy"
          >
            {title}
          </h1>
          {headline ? (
            <p className="page-intro-headline">{renderHeadline()}</p>
          ) : null}
          {description ? <p className="page-intro-description">{description}</p> : null}
          {actions && actions.length > 0 ? (
            <div className="flex flex-wrap gap-3 pt-1">
              {actions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    index === 0
                      ? "bg-brand-navy text-white hover:bg-brand-navy-dark"
                      : "border border-border-default bg-surface-raised text-text-primary hover:bg-surface-tint",
                  )}
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
