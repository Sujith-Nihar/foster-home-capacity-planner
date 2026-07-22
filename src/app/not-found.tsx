import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 px-4 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
      <p className="text-muted-foreground">
        The requested page does not exist or may have moved.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Return to overview
      </Button>
    </div>
  );
}
