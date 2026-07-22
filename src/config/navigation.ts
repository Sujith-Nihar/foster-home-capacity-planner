import type { LucideIcon } from "lucide-react";
import { BookOpen, Home, MapPin, Users } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

/** Primary application navigation items (drill-down routes are not listed here). */
export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Overview",
    href: "/",
    icon: Home,
    description: "Statewide capacity snapshot and attention areas",
  },
  {
    label: "Recruitment",
    href: "/recruitment",
    icon: MapPin,
    description: "County-level foster home recruitment planning priorities",
  },
  {
    label: "Retention",
    href: "/retention",
    icon: Users,
    description: "Licensed provider outreach priorities",
  },
  {
    label: "Methodology",
    href: "/methodology",
    icon: BookOpen,
    description: "Metric definitions, assumptions and limitations",
  },
] as const;

export const APP_TITLE = "Foster Home Capacity Planner" as const;

export const APP_DESCRIPTION =
  "Decision-support tool for Illinois DCFS foster home recruitment and retention planning." as const;
