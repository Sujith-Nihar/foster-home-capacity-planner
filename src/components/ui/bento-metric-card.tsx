import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type BentoMetricVariant = "default" | "featured" | "positive" | "amber" | "attention";

type BentoMetricCardProps = {
  label: string;
  value: ReactNode;
  helperText?: string;
  icon?: ReactNode;
  href?: string;
  variant?: BentoMetricVariant;
  className?: string;
};

const variantClasses: Record<BentoMetricVariant, string> = {
  default:
    "border-border-subtle bg-surface-raised hover:border-border-default",
  featured:
    "border-border-subtle bg-surface-raised hover:border-border-default",
  positive: "border-status-low-border bg-status-low-bg/40 hover:border-status-low-border",
  amber: "border-status-medium-border bg-status-medium-bg/35 hover:border-status-medium-border",
  attention: "border-status-high-border bg-status-high-bg/35 hover:border-status-high-border",
};

function BentoMetricCardBody({
  label,
  value,
  helperText,
  icon,
  variant = "default",
}: BentoMetricCardProps) {
  return (
    <div className="flex h-full flex-col justify-between gap-3 p-5 sm:p-6">
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          {icon ? <span className="mt-0.5 shrink-0 text-text-tertiary">{icon}</span> : null}
          <p className="text-[13px] font-medium leading-snug text-text-secondary">{label}</p>
        </div>
        <p
          className={cn(
            "font-semibold tabular-nums tracking-tight text-text-primary",
            variant === "featured"
              ? "text-4xl sm:text-5xl"
              : "text-3xl sm:text-[2rem]",
          )}
        >
          {value}
        </p>
      </div>
      {helperText ? (
        <p className="text-xs leading-5 text-text-tertiary">{helperText}</p>
      ) : null}
    </div>
  );
}

export function BentoMetricCard({
  label,
  value,
  helperText,
  icon,
  href,
  variant = "default",
  className,
}: BentoMetricCardProps) {
  const card = (
    <div
      className={cn(
        "interactive-lift h-full overflow-hidden rounded-[1.25rem] border shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        variantClasses[variant],
        className,
      )}
    >
      <BentoMetricCardBody
        label={label}
        value={value}
        helperText={helperText}
        icon={icon}
        variant={variant}
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {card}
      </Link>
    );
  }

  return card;
}

type BentoProviderStripProps = {
  items: Array<{
    label: string;
    value: ReactNode;
    href?: string;
  }>;
};

export function BentoProviderStrip({ items }: BentoProviderStripProps) {
  return (
    <div className="interactive-lift grid h-full overflow-hidden rounded-[1.25rem] border border-border-subtle bg-surface-raised shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:grid-cols-3">
      {items.map((item, index) => {
        const content = (
          <div
            className={cn(
              "flex h-full flex-col justify-center gap-1 px-5 py-5 sm:px-6",
              index > 0 ? "border-t border-border-subtle sm:border-t-0 sm:border-l" : "",
            )}
          >
            <p className="text-[13px] font-medium text-text-secondary">{item.label}</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-primary sm:text-[1.75rem]">
              {item.value}
            </p>
          </div>
        );

        if (item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="block h-full transition-colors hover:bg-surface-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              {content}
            </Link>
          );
        }

        return <div key={item.label}>{content}</div>;
      })}
    </div>
  );
}
