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
  description?: string;
  actions?: PageIntroductionAction[];
  aside?: ReactNode;
  className?: string;
  variant?: "hero" | "operational";
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
  variant = "operational",
}: PageIntroductionProps) {
  const displayHeadline = headline ?? title ?? "";
  const isHero = variant === "hero";

  function renderHeadline() {
    if (!highlightPhrase || !displayHeadline.includes(highlightPhrase)) {
      return displayHeadline;
    }

    const [before, ...rest] = displayHeadline.split(highlightPhrase);
    const after = rest.join(highlightPhrase);

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
          <TextReveal as="p" className="eyebrow-label" immediate={isHero}>
            {eyebrow}
          </TextReveal>
          <TextReveal as="h1" id="page-intro-title" className="page-intro-headline" immediate={isHero}>
            {renderHeadline()}
          </TextReveal>
          {description ? (
            <TextReveal
              as="p"
              className={cn("page-intro-description", isHero && "text-center")}
              delayMs={isHero ? 140 : 0}
              immediate={isHero}
            >
              {description}
            </TextReveal>
          ) : null}
          {actions && actions.length > 0 ? (
            <div className={cn("flex flex-wrap gap-3 pt-1", isHero && "justify-center")}>
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
            </div>
          ) : null}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}
