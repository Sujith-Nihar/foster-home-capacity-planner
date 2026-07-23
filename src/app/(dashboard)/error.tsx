"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Unable to load dashboard content"
      description="The page could not load data from the reporting database. Check the Supabase configuration and try again."
      actions={
        <>
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button type="button" variant="outline" nativeButton={false} render={<Link href="/" />}>
            Reload overview
          </Button>
        </>
      }
    />
  );
}
