import { describe, expect, it } from "vitest";

import {
  COMPARABLE_COUNTIES,
  PROTOTYPE_PLANNING_RULES_INTRO,
  RECRUITMENT_METRICS,
  RETENTION_METRICS,
} from "@/content/methodology";
import { explainRecruitmentReason } from "@/lib/recruitment/reason-display";
import { explainOutreachReason } from "@/lib/retention/reason-display";
import { buildMethodologySections } from "@/lib/methodology/sections";

describe("centralized methodology content", () => {
  it("defines comparable counties once", () => {
    expect(COMPARABLE_COUNTIES.explanation).toContain("at least 10 current foster-home children");
    expect(COMPARABLE_COUNTIES.explanation).toContain("3 engaged providers");
  });

  it("maps recruitment percentile reasons to plain language", () => {
    expect(
      explainRecruitmentReason(
        "Above the 75th percentile statewide for children per active provider",
      ).primary,
    ).toBe("More children per engaged provider than most comparable counties");
  });

  it("maps retention engagement rules to plain language", () => {
    expect(
      explainOutreachReason("Engagement below 10% with at least 90 eligible licensed days", {
        daysSinceLastPlacement: 120,
        daysUntilExpiration: 45,
        currentlyHasPlacement: false,
        engagementRateLast365: 0.05,
      }).primary,
    ).toBe("Limited placement activity during the past 12 months");
  });

  it("structures methodology into four explicit sections", () => {
    const sections = buildMethodologySections();
    expect(sections.map((section) => section.title)).toEqual([
      "1. Source-data definitions",
      "2. Metrics calculated by the application",
      "3. Planning rules selected for this prototype",
      "4. Limitations and appropriate use",
    ]);
    expect(sections[2]?.paragraphs.join(" ")).toContain(PROTOTYPE_PLANNING_RULES_INTRO);
  });

  it("documents prototype caveats for recruitment and retention", () => {
    expect(RECRUITMENT_METRICS.recruitmentAttention.limitation).toMatch(
      /does not prove that a county has a foster-home shortage/i,
    );
    expect(RETENTION_METRICS.outreachPriority.limitation).toMatch(/does not predict/i);
  });

  it("documents comparison minimum policy note on methodology", () => {
    const sections = buildMethodologySections();
    expect(sections[2]?.paragraphs.join(" ")).toContain(
      "were not provided as an official DCFS policy",
    );
  });
});
