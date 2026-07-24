import { describe, expect, it } from "vitest";

import {
  buildMethodologySections,
  METHODOLOGY_CALLOUTS,
  REQUIRED_METHODOLOGY_PHRASES,
} from "@/lib/methodology/sections";

describe("methodology content", () => {
  it("documents the four required analytical sections", () => {
    const sections = buildMethodologySections();
    const titles = sections.map((section) => section.title);

    expect(titles).toEqual([
      "1. Source-data definitions",
      "2. Metrics calculated by the application",
      "3. Planning rules selected for this prototype",
      "4. Limitations and appropriate use",
    ]);
  });

  it("includes the required explicit interpretation statements", () => {
    for (const phrase of REQUIRED_METHODOLOGY_PHRASES) {
      expect(METHODOLOGY_CALLOUTS.join(" ")).toContain(phrase);
    }

    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/available beds/i);
    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/does not predict/i);
    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/prototype planning rule/i);
    expect(METHODOLOGY_CALLOUTS.join(" ")).toMatch(/not automatically assumed suitable/i);
  });

  it("anchors definitions to the fixed reporting date", () => {
    const reportingSection = buildMethodologySections().find(
      (section) => section.id === "source-data-definitions",
    );

    expect(reportingSection?.paragraphs.join(" ")).toContain("reporting date");
    const allText = buildMethodologySections()
      .flatMap((section) => [...section.paragraphs, ...(section.bullets ?? [])])
      .join(" ");
    expect(allText).toContain("July 1, 2026");
  });
});
