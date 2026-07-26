import type { ReactNode } from "react";
import Link from "next/link";

import { HandDrawnUnderline } from "@/components/ui/hand-drawn-underline";
import { TextReveal } from "@/components/ui/text-reveal";
import { cn } from "@/lib/utils";

type PageIntroductionAction = {
  label: string;
  href: string;
};

type PageIntroductionProps = {
  title?: string;
  eyebrow: string;
  headline?: string;
  highlightPhrase?: string;
  description?: ReactNode;
  actions?: PageIntroductionAction[];
  actionSlot?: ReactNode;
  aside?: ReactNode;
  className?: string;
  variant?: "hero" | "operational";
};

function findHighlightRange(headline: string, highlightPhrase?: string) {
  if (!highlightPhrase) {
    return null;
  }

  const lowerHeadline = headline.toLowerCase();
  const lowerPhrase = highlightPhrase.toLowerCase();
  const start = lowerHeadline.indexOf(lowerPhrase);
  if (start === -1) {
    return null;
  }

  return {
    before: headline.slice(0, start),
    highlight: headline.slice(start, start + highlightPhrase.length),
    after: headline.slice(start + highlightPhrase.length),
  };
}

export function PageIntroduction({
  title,
  eyebrow,
  headline,
  highlightPhrase,
  description,
  actions,
  actionSlot,
  aside,
  className,
  variant = "operational",
}: PageIntroductionProps) {
  const displayHeadline = headline ?? title ?? "";
  const isHero = variant === "hero";
  const highlight = findHighlightRange(displayHeadline, highlightPhrase);

  function renderHeadline() {
    if (!highlight) {
      return displayHeadline;
    }

    return (
      <>
        {highlight.before}
        <span className="relative inline-block text-brand-navy">
          {highlight.highlight}
          <HandDrawnUnderline />
        </span>
        {highlight.after}
      </>
    );
  }

  return (
    <section
      className={cn(
        "page-intro",
        isHero ? "page-intro--hero" : "page-intro--operational",
        className,
      )}
    >
      <div
        className={cn(
          "grid w-full gap-6",
          aside ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center" : "",
          isHero && !aside && "mx-auto max-w-3xl",
        )}
      >
        <div className={cn("space-y-4", isHero && "flex flex-col items-center")}>
          <TextReveal as="p" variant="eyebrow" className="eyebrow-label" immediate>
            {eyebrow}
          </TextReveal>
          <TextReveal as="h1" id="page-intro-title" variant="heading" className="page-intro-headline" immediate>
            {renderHeadline()}
          </TextReveal>
          {description ? (
            <TextReveal
              as="p"
              variant="description"
              className={cn("page-intro-description", isHero && "text-center")}
              immediate
            >
              {description}
            </TextReveal>
          ) : null}
          {actionSlot ? (
            <TextReveal
              as="div"
              variant="action"
              className={cn("flex flex-wrap gap-3 pt-1", isHero && "justify-center")}
              immediate
            >
              {actionSlot}
            </TextReveal>
          ) : null}
          {!actionSlot && actions && actions.length > 0 ? (
            <TextReveal
              as="div"
              variant="action"
              className={cn("flex flex-wrap gap-3 pt-1", isHero && "justify-center")}
              immediate
            >
              {actions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    index === 0 ? "fi-btn-primary" : "fi-btn-secondary",
                  )}
                >
                  {action.label}
                </Link>
              ))}
            </TextReveal>
          ) : null}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}
