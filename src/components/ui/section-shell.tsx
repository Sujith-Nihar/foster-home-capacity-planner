import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionTone = "default" | "raised" | "tint" | "attention" | "dark";

type SectionShellProps = {
  children: ReactNode;
  tone?: SectionTone;
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
} & Pick<ComponentProps<"section">, "aria-label">;

const toneClasses: Record<SectionTone, string> = {
  default: "",
  raised: "rounded-[var(--radius-hero)] border border-border-subtle bg-surface-raised p-6 sm:p-8",
  tint: "rounded-[var(--radius-hero)] bg-surface-tint p-6 sm:p-8",
  attention:
    "rounded-[var(--radius-hero)] border border-status-medium-border bg-attention-ivory p-6 sm:p-8",
  dark: "fi-dark-section px-0 py-10 sm:py-14",
};

export function SectionShell({
  children,
  tone = "default",
  className,
  id,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
}: SectionShellProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      className={cn(toneClasses[tone], className)}
    >
      {children}
    </section>
  );
}

type SectionHeadingProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  className?: string;
  titleId?: string;
  inverted?: boolean;
};

export function SectionHeading({
  title,
  description,
  eyebrow,
  className,
  titleId,
  inverted = false,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-5 space-y-2", className)}>
      {eyebrow ? (
        <p className={cn("eyebrow-label", inverted ? "text-white/72" : "text-text-tertiary")}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={titleId}
        className={cn(
          "text-[clamp(1.625rem,2.5vw,2.125rem)] font-medium tracking-tight",
          inverted ? "text-white" : "text-text-primary",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-3xl text-base leading-relaxed",
            inverted ? "text-white/78" : "text-text-secondary",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
