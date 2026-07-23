import Link from "next/link";

import { PrimaryNav } from "@/components/layout/primary-nav";
import { APP_BRAND_NAME } from "@/config/navigation";
import { REPORTING_DATE } from "@/config/metrics";
import { formatReportingDate } from "@/lib/utils/formatters";

export function AppSidebar() {
  return (
    <aside className="surface-glass fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-sidebar-border lg:flex">
      <div className="border-b border-sidebar-border px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap text-text-tertiary">
          Illinois DCFS
        </p>
        <p className="mt-1.5 text-[15px] font-semibold leading-tight text-text-primary">
          {APP_BRAND_NAME}
        </p>
      </div>
      <PrimaryNav className="flex-1 overflow-y-auto px-3 py-4" />
      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs text-text-tertiary">
          Data through{" "}
          <time dateTime={REPORTING_DATE} className="font-medium text-text-secondary">
            {formatReportingDate(REPORTING_DATE)}
          </time>
        </p>
        <Link
          href="/methodology"
          className="mt-2 inline-flex text-xs font-medium text-accent-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Methodology definitions
        </Link>
      </div>
    </aside>
  );
}
