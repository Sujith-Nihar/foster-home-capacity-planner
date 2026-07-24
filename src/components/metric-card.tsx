import type { ReactNode } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricCardVariant = "default" | "neutral" | "positive" | "amber" | "attention";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  helperText?: string;
  icon?: ReactNode;
  href?: string;
  className?: string;
  variant?: MetricCardVariant;
};

const variantStyles: Record<MetricCardVariant, string> = {
  default: "border-border-default bg-surface-raised",
  neutral: "border-border-default bg-surface-raised",
  positive: "border-status-low-border bg-status-low-bg/50",
  amber: "border-status-medium-border bg-status-medium-bg/50",
  attention: "border-status-high-border bg-status-high-bg/50",
};

const iconVariantStyles: Record<MetricCardVariant, string> = {
  default: "text-text-tertiary",
  neutral: "text-text-tertiary",
  positive: "text-status-low",
  amber: "text-status-medium",
  attention: "text-status-high",
};

function MetricCardContent({
  label,
  value,
  helperText,
  icon,
  variant = "default",
}: MetricCardProps) {
  return (
    <>
      <CardHeader className="gap-1 pb-0">
        <CardTitle className="flex items-center gap-2 text-[13px] font-medium leading-tight text-text-secondary">
          {icon ? (
            <span className={cn("shrink-0", iconVariantStyles[variant])}>{icon}</span>
          ) : null}
          <span className="min-w-0 text-pretty">{label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-1 pt-2">
        <p className="text-[1.75rem] font-semibold leading-none tabular-nums tracking-tight text-text-primary">
          {value}
        </p>
        {helperText ? (
          <p className="line-clamp-2 text-xs leading-5 text-text-secondary">{helperText}</p>
        ) : null}
      </CardContent>
    </>
  );
}

export function MetricCard({
  label,
  value,
  helperText,
  icon,
  href,
  className,
  variant = "default",
}: MetricCardProps) {
  const cardClassName = cn(
    "metric-card-surface interactive-lift h-full",
    variantStyles[variant],
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card
          size="sm"
          className={cn(cardClassName, "shadow-none ring-0 hover:border-border-strong")}
        >
          <MetricCardContent
            label={label}
            value={value}
            helperText={helperText}
            icon={icon}
            variant={variant}
          />
        </Card>
      </Link>
    );
  }

  return (
    <Card size="sm" className={cn(cardClassName, "shadow-none ring-0")}>
      <MetricCardContent
        label={label}
        value={value}
        helperText={helperText}
        icon={icon}
        variant={variant}
      />
    </Card>
  );
}
