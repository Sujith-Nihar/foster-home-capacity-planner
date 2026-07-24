import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full min-w-0 flex-col">
      <AppHeader />
      <main className="min-w-0 flex-1">
        <div className="app-container min-w-0 py-6 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
