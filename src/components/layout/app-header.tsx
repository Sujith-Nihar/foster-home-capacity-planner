import { ReportingDateBadge } from "@/components/reporting-date-badge";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PrimaryNavigation } from "@/components/layout/primary-navigation";

export function AppHeader() {
  return (
    <header
      aria-label="Application header"
      className="surface-glass sticky top-0 z-30 border-b border-border-subtle shadow-[0_1px_3px_rgba(22,59,76,0.04)]"
    >
      <div className="app-container">
        <div className="flex h-14 items-center justify-between gap-4 border-b border-border-subtle">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <MobileNav />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                Foster Insights
              </p>
            </div>
          </div>
          <p className="hidden truncate text-sm font-medium text-text-primary sm:block">
            Illinois DCFS Capacity Planner
          </p>
          <ReportingDateBadge className="shrink-0" />
        </div>
        <div className="hidden h-11 items-center lg:flex">
          <PrimaryNavigation />
        </div>
      </div>
    </header>
  );
}
