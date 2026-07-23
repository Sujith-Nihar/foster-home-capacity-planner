import { describe, expect, it } from "vitest";

import {
  buildMethodologySections,
  METHODOLOGY_CALLOUTS,
  REQUIRED_METHODOLOGY_PHRASES,
} from "@/lib/methodology/sections";

describe("methodology content", () => {
  it("documents every required analytical topic", () => {
    const sections = buildMethodologySections();
    const titles = sections.map((section) => section.title);

    expect(titles).toEqual([
      "Source datasets",
      "Reporting date",
      "Current-child definition",
      "Latest-placement definition",
      "Current-placement definition",
      "Current-license definition",
      "County normalization",
      "Missing-age handling",
      "Interval merging",
      "Active days",
      "Recent-window clipping",
      "Eligible licensed days",
      "Engagement rate",
      "Current provider preferences",
      "Recruitment indicators and priority",
      "Retention indicators and priority",
      "Minimum county-volume rules",
      "Privacy choices",
      "Limitations",
    ]);
  });

  it("includes the required explicit interpretation statements", () => {
    for (const phrase of REQUIRED_METHODOLOGY_PHRASES) {
      expect(METHODOLOGY_CALLOUTS.join(" ")).toContain(phrase);
    }

    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/not available beds/i);
    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/not a prediction of closure/i);
    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/not proof that a county is short/i);
    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/not automatically assumed suitable/i);
  });

  it("anchors definitions to the fixed reporting date", () => {
    const reportingSection = buildMethodologySections().find(
      (section) => section.id === "reporting-date",
    );

    expect(reportingSection?.paragraphs.join(" ")).toContain("July 1, 2026");
  });
});
