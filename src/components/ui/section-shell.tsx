import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionTone = "default" | "raised" | "tint" | "attention";

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
      className={cn("section-enter", toneClasses[tone], className)}
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
};

export function SectionHeading({
  title,
  description,
  eyebrow,
  className,
  titleId,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-5 space-y-2", className)}>
      {eyebrow ? <p className="eyebrow-label text-text-tertiary">{eyebrow}</p> : null}
      <h2 id={titleId} className="text-xl font-medium tracking-tight text-text-primary sm:text-2xl">
        {title}
      </h2>
      {description ? <p className="max-w-3xl text-sm leading-6 text-text-secondary">{description}</p> : null}
    </div>
  );
}
