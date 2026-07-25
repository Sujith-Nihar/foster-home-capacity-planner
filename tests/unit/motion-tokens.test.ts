import { describe, expect, it } from "vitest";

import { MOTION_DELAY_MS, MOTION_MS } from "@/lib/motion/tokens";

describe("motion tokens", () => {
  it("uses the shared Foster Insights timing scale", () => {
    expect(MOTION_MS.hover).toBe(180);
    expect(MOTION_MS.nav).toBe(260);
    expect(MOTION_MS.eyebrow).toBe(700);
    expect(MOTION_MS.heading).toBe(850);
    expect(MOTION_MS.description).toBe(800);
    expect(MOTION_MS.action).toBe(750);
    expect(MOTION_MS.section).toBe(850);
    expect(MOTION_MS.underline).toBe(1350);
    expect(MOTION_MS.disclosure).toBe(260);
  });

  it("uses the shared reveal delay scale", () => {
    expect(MOTION_DELAY_MS.eyebrow).toBe(40);
    expect(MOTION_DELAY_MS.heading).toBe(110);
    expect(MOTION_DELAY_MS.description).toBe(210);
    expect(MOTION_DELAY_MS.actions).toBe(300);
    expect(MOTION_DELAY_MS.underline).toBe(420);
    expect(MOTION_DELAY_MS.sectionMax).toBe(80);
  });
});
