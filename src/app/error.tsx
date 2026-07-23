"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ErrorState } from "@/components/error-state";
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
    <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center px-4 py-16">
      <ErrorState
        title="Something went wrong"
        description="The application encountered an unexpected error. You can try again or return to the overview."
        actions={
          <>
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <Button type="button" variant="outline" nativeButton={false} render={<Link href="/" />}>
              Go to overview
            </Button>
          </>
        }
      />
    </div>
  );
}
