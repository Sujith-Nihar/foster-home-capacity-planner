import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const LOGO_WIDTH = 1500;
const LOGO_HEIGHT = 457;

type FosterInsightsLogoProps = {
  className?: string;
  priority?: boolean;
};

export function FosterInsightsLogo({ className, priority = true }: FosterInsightsLogoProps) {
  return (
    <Link
      href="/"
      aria-label="Foster Insights — Capacity Planner overview"
      className={cn(
        "app-header-logo-link inline-flex shrink-0 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Image
        src="/brand/foster-insights-logo.webp"
        alt="Foster Insights"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        unoptimized
        sizes="(max-width: 640px) 150px, (max-width: 1024px) 185px, 220px"
        className="app-header-logo block h-auto w-[145px] bg-transparent object-contain sm:w-[170px] lg:w-[205px] xl:w-[220px]"
      />
    </Link>
  );
}

export const FOSTER_INSIGHTS_LOGO_INTRINSIC = {
  width: LOGO_WIDTH,
  height: LOGO_HEIGHT,
  aspectRatio: LOGO_WIDTH / LOGO_HEIGHT,
} as const;
