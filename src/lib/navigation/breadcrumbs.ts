export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function breadcrumbOverview(): BreadcrumbItem[] {
  return [{ label: "Overview" }];
}

export function breadcrumbRecruitment(): BreadcrumbItem[] {
  return [
    { label: "Overview", href: "/" },
    { label: "Recruitment" },
  ];
}

export function breadcrumbCounty(county: string): BreadcrumbItem[] {
  return [
    { label: "Overview", href: "/" },
    { label: "Recruitment", href: "/recruitment" },
    { label: county },
  ];
}

export function breadcrumbRetention(): BreadcrumbItem[] {
  return [
    { label: "Overview", href: "/" },
    { label: "Retention" },
  ];
}

export function breadcrumbProvider(providerId: string): BreadcrumbItem[] {
  return [
    { label: "Overview", href: "/" },
    { label: "Retention", href: "/retention" },
    { label: `Provider ${providerId}` },
  ];
}

export function breadcrumbMethodology(): BreadcrumbItem[] {
  return [
    { label: "Overview", href: "/" },
    { label: "Methodology" },
  ];
}
