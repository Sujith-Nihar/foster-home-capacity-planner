"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

export function useOperationalFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (queryString: string) => {
      const href = queryString ? `${pathname}${queryString}` : pathname;
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router],
  );

  return { navigate, isPending, pathname };
}
