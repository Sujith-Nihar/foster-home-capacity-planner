import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OverviewInsightsDto } from "@/lib/types/domain";

type AttentionPanelProps = {
  insights: OverviewInsightsDto;
};

export function AttentionPanel({ insights }: AttentionPanelProps) {
  return (
    <section aria-labelledby="attention-panel-heading">
      <Card className="border-status-medium-border bg-status-medium-bg shadow-none">
        <CardHeader>
          <h2
            id="attention-panel-heading"
            className="flex items-center gap-2 text-base font-medium text-text-primary"
          >
            <AlertTriangle className="size-4 text-status-medium" aria-hidden="true" />
            What needs attention
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium text-text-primary">{insights.headline}</p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
            {insights.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
