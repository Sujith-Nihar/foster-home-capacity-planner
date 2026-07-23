import type { ReactNode } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  helperText?: string;
  icon?: ReactNode;
  href?: string;
  className?: string;
};

function MetricCardContent({ label, value, helperText, icon }: MetricCardProps) {
  return (
    <>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          {icon ? <span className="text-text-tertiary">{icon}</span> : null}
          <span>{label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-primary">
          {value}
        </p>
        {helperText ? <p className="text-sm text-text-tertiary">{helperText}</p> : null}
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
}: MetricCardProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <Card className="h-full shadow-none transition-colors hover:border-border-strong hover:bg-muted/30">
          <MetricCardContent
            label={label}
            value={value}
            helperText={helperText}
            icon={icon}
          />
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn("shadow-none", className)}>
      <MetricCardContent label={label} value={value} helperText={helperText} icon={icon} />
    </Card>
  );
}
