import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

const SIDEBAR_WIDTH = "236px";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-full bg-surface-base">
      <AppSidebar />
      <div
        className="flex min-h-full min-w-0 flex-col"
        style={{ paddingLeft: `max(0px, env(safe-area-inset-left))` }}
      >
        <div className="lg:pl-[var(--app-sidebar-width)]" style={{ ["--app-sidebar-width" as string]: SIDEBAR_WIDTH }}>
          <AppHeader />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-6 lg:px-8 lg:py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
