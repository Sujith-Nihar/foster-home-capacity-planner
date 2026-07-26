import { describe, expect, it } from "vitest";

import {
  buildMethodologyIntroDescription,
  METHODOLOGY_SECTION_IDS,
} from "@/lib/methodology/page-content";
import {
  buildMethodologySections,
  METHODOLOGY_CALLOUTS,
  REQUIRED_METHODOLOGY_PHRASES,
} from "@/lib/methodology/sections";

describe("methodology content", () => {
  it("documents the seven required analytical sections", () => {
    const sections = buildMethodologySections();
    const ids = sections.map((section) => section.id);

    expect(ids).toEqual([
      METHODOLOGY_SECTION_IDS.definitions,
      METHODOLOGY_SECTION_IDS.recruitmentMetrics,
      METHODOLOGY_SECTION_IDS.retentionMetrics,
      METHODOLOGY_SECTION_IDS.recruitmentRules,
      METHODOLOGY_SECTION_IDS.retentionRules,
      METHODOLOGY_SECTION_IDS.limitations,
      METHODOLOGY_SECTION_IDS.technicalDetails,
    ]);
  });

  it("includes the required explicit interpretation statements", () => {
    for (const phrase of REQUIRED_METHODOLOGY_PHRASES) {
      expect(METHODOLOGY_CALLOUTS.join(" ")).toContain(phrase);
    }

    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/available beds/i);
    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/not official DCFS classifications/i);
    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/child identifiers/i);
  });

  it("anchors the intro to the fixed reporting date", () => {
    expect(buildMethodologyIntroDescription()).toContain("July 1, 2026");
    expect(buildMethodologyIntroDescription()).toContain("reporting snapshot");
  });
});
