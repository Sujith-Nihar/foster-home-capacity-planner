"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { scrollToRetentionProviderList } from "@/lib/retention/scroll-to-provider-list";
import { RETENTION_PROVIDER_LIST_HASH } from "@/lib/retention/expiring-licenses";

export function RetentionProviderListScrollManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== "/retention" || window.location.hash !== RETENTION_PROVIDER_LIST_HASH) {
      return;
    }

    let frame2 = 0;
    const frame1 = window.requestAnimationFrame(() => {
      frame2 = window.requestAnimationFrame(() => {
        scrollToRetentionProviderList();
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
    };
  }, [pathname, searchParams]);

  return null;
}
