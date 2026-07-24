import { ReportingDateBadge } from "@/components/reporting-date-badge";
import { FosterInsightsLogo } from "@/components/layout/foster-insights-logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PrimaryNavigation } from "@/components/layout/primary-navigation";

export function AppHeader() {
  return (
    <header className="app-header" aria-label="Application header">
      <div className="app-header__inner">
        <div className="app-header__brand-row">
          <div className="app-header__logo">
            <FosterInsightsLogo />
          </div>

          <p className="app-header__title hidden truncate md:block">
            Illinois DCFS Capacity Planner
          </p>

          <div className="app-header__end">
            <ReportingDateBadge className="hidden md:inline-flex" />
            <div className="lg:hidden">
              <MobileNav />
            </div>
          </div>
        </div>

        <div className="app-header__nav-row hidden lg:flex">
          <PrimaryNavigation />
        </div>
      </div>
    </header>
  );
}
