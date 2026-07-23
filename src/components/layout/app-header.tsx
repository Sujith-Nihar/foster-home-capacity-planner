import { ReportingDateBadge } from "@/components/reporting-date-badge";
import { HeaderContext } from "@/components/layout/header-context";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppHeader() {
  return (
    <header
      aria-label="Application header"
      className="surface-glass sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border-subtle px-4 sm:px-6"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="lg:hidden">
          <MobileNav />
        </div>
        <HeaderContext />
      </div>
      <ReportingDateBadge className="shrink-0" />
    </header>
  );
}
