import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { BackToTop } from "@/components/layout/back-to-top";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full min-w-0 flex-col">
      <AppHeader />
      <main className="min-w-0 flex-1">
        <div className="app-container min-w-0 pb-6 lg:pb-8">{children}</div>
      </main>
      <BackToTop />
    </div>
  );
}
