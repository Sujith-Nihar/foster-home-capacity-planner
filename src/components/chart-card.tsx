import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader>
        <h3 className="flex items-center gap-2 text-base font-medium text-text-primary">
          <BarChart3 className="size-4 text-text-tertiary" aria-hidden="true" />
          {title}
        </h3>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {children ?? (
          <div
            className="flex min-h-48 items-center justify-center rounded-md border border-dashed border-border-default bg-muted/40 px-4 text-sm text-text-tertiary"
            role="status"
          >
            Chart content will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
