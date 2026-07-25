const STICKY_HEADER_OFFSET_PX = 128;

export function scrollToResultsHeading(headingId: string) {
  const heading = document.getElementById(headingId);
  if (!heading) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top =
    heading.getBoundingClientRect().top + window.scrollY - STICKY_HEADER_OFFSET_PX;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}
