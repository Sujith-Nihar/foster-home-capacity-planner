export const MOTION_MS = {
  hover: 180,
  nav: 260,
  eyebrow: 700,
  heading: 850,
  description: 800,
  action: 750,
  section: 850,
  underline: 1350,
  disclosure: 260,
} as const;

export const MOTION_DELAY_MS = {
  eyebrow: 40,
  heading: 110,
  description: 210,
  actions: 300,
  underline: 420,
  sectionMax: 80,
} as const;

export function readMotionDelayMs(
  variableName: string,
  fallback: number,
): number {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}
