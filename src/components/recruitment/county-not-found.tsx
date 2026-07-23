import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export function CountyNotFound() {
  return (
    <EmptyState
      title="County not found"
      description="The requested county does not exist in the reporting dataset for the active reporting date."
      action={
        <Button nativeButton={false} render={<Link href="/recruitment" />}>
          Back to recruitment
        </Button>
      }
    />
  );
}
