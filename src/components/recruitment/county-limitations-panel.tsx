import { AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

type CountyLimitationsPanelProps = {
  limitations: string[];
};

export function CountyLimitationsPanel({ limitations }: CountyLimitationsPanelProps) {
  return (
    <section aria-labelledby="county-limitations-heading">
      <Card className="border-border-strong shadow-none">
        <CardHeader>
          <h2
            id="county-limitations-heading"
            className="flex items-center gap-2 text-base font-medium text-text-primary"
          >
            <AlertCircle className="size-4 text-text-tertiary" aria-hidden="true" />
            Limitations and interpretation
          </h2>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
            {limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
