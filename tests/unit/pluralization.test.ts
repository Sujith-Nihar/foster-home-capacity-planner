import { describe, expect, it } from "vitest";

import {
  formatActiveDayCount,
  formatAdditionalFactorCount,
  formatDayCount,
  formatEndsInDayCount,
} from "@/lib/utils/pluralization";

describe("pluralization helpers", () => {
  it("formats day counts with singular and plural grammar", () => {
    expect(formatDayCount(1)).toBe("1 day");
    expect(formatDayCount(2)).toBe("2 days");
  });

  it("formats active day counts with singular and plural grammar", () => {
    expect(formatActiveDayCount(1)).toBe("1 active day");
    expect(formatActiveDayCount(862)).toBe("862 active days");
  });

  it("formats relative license timing", () => {
    expect(formatEndsInDayCount(1)).toBe("Ends in 1 day");
    expect(formatEndsInDayCount(45)).toBe("Ends in 45 days");
  });

  it("formats additional factor labels", () => {
    expect(formatAdditionalFactorCount(1)).toBe("View 1 more factor");
    expect(formatAdditionalFactorCount(2)).toBe("View 2 more factors");
  });
});
