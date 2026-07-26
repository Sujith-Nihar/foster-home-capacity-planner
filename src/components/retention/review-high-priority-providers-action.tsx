import Link from "next/link";

import { buildHighPriorityProvidersHref } from "@/lib/retention/high-priority-providers";

export function ReviewHighPriorityProvidersAction() {
  return (
    <Link href={buildHighPriorityProvidersHref()} className="fi-btn-primary min-h-11 h-11 px-5">
      Review high-priority providers
    </Link>
  );
}
