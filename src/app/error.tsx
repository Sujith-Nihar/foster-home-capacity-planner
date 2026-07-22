"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 px-4 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Something went wrong</h2>
      <p className="text-muted-foreground">
        The application encountered an unexpected error. You can try again or return
        to the overview.
      </p>
      <div className="flex gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button type="button" variant="outline" nativeButton={false} render={<Link href="/" />}>
          Go to overview
        </Button>
      </div>
    </div>
  );
}
