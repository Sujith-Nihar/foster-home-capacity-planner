import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export function ProviderNotFound() {
  return (
    <EmptyState
      title="Provider not found"
      description="The requested provider does not exist in the reporting dataset for the active reporting date."
      action={
        <Button nativeButton={false} render={<Link href="/retention" />}>
          Back to retention
        </Button>
      }
    />
  );
}
