import { RETENTION_PROVIDER_LIST_ID } from "@/lib/retention/expiring-licenses";

export function scrollToRetentionProviderList() {
  const section = document.getElementById(RETENTION_PROVIDER_LIST_ID);
  const heading = document.getElementById("retention-provider-table-heading");

  if (!section) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });

  if (heading instanceof HTMLElement) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}
