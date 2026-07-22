import Link from "next/link";

import { APP_TITLE, PRIMARY_NAV_ITEMS } from "@/config/navigation";
import { REPORTING_DATE } from "@/config/metrics";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Illinois DCFS decision support
              </p>
              <h1 className="text-xl font-semibold tracking-tight">{APP_TITLE}</h1>
            </div>
            <p className="text-sm tabular-nums text-muted-foreground">
              Reporting date: {REPORTING_DATE}
            </p>
          </div>
          <nav aria-label="Primary">
            <ul className="flex flex-wrap gap-2">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium",
                      "text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
