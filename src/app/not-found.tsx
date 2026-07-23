import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center px-4 py-16">
      <EmptyState
        title="Page not found"
        description="The requested page does not exist or may have moved."
        action={
          <Button nativeButton={false} render={<Link href="/" />}>
            Return to overview
          </Button>
        }
      />
    </div>
  );
}
