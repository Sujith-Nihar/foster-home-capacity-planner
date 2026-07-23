import type { LucideIcon } from "lucide-react";
import { BookOpen, Home, MapPin, Users } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/** Primary application navigation items (drill-down routes are not listed here). */
export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Overview",
    href: "/",
    icon: Home,
  },
  {
    label: "Recruitment",
    href: "/recruitment",
    icon: MapPin,
  },
  {
    label: "Retention",
    href: "/retention",
    icon: Users,
  },
  {
    label: "Methodology",
    href: "/methodology",
    icon: BookOpen,
  },
] as const;

export const APP_BRAND_NAME = "Foster Capacity Planner" as const;

export const APP_TITLE = "Foster Home Capacity Planner" as const;

export const APP_DESCRIPTION =
  "Decision-support tool for Illinois DCFS foster home recruitment and retention planning." as const;
