import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ReportingDateBadge } from "@/components/reporting-date-badge";
import { APP_TITLE } from "@/config/navigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full bg-surface-base">
      <AppSidebar />
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <header className="border-b border-border-default bg-surface-raised lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <MobileNav />
              <p className="text-sm font-semibold text-text-primary">{APP_TITLE}</p>
            </div>
            <ReportingDateBadge className="hidden sm:inline-flex" />
          </div>
        </header>
        <div className="hidden border-b border-border-default bg-surface-raised px-6 py-3 lg:flex lg:justify-end">
          <header aria-label="Reporting context">
            <ReportingDateBadge />
          </header>
        </div>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
