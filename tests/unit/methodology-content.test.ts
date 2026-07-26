import { describe, expect, it } from "vitest";

import {
  COMPARABLE_COUNTIES,
  PROTOTYPE_PLANNING_RULES_INTRO,
  RECRUITMENT_METRICS,
  RETENTION_METRICS,
} from "@/content/methodology";
import { explainRecruitmentReason } from "@/lib/recruitment/reason-display";
import { explainOutreachReason } from "@/lib/retention/reason-display";
import {
  buildMethodologyIntroDescription,
  buildStaffFacingRetentionOutreachRules,
  IMPORTANT_THINGS_TO_KNOW,
  METHODOLOGY_NAV_ITEMS,
  METHODOLOGY_SECTION_IDS,
} from "@/lib/methodology/page-content";
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

  it("structures methodology navigation into seven explicit sections", () => {
    const sections = buildMethodologySections();
    expect(sections.map((section) => section.id)).toEqual([
      METHODOLOGY_SECTION_IDS.definitions,
      METHODOLOGY_SECTION_IDS.recruitmentMetrics,
      METHODOLOGY_SECTION_IDS.retentionMetrics,
      METHODOLOGY_SECTION_IDS.recruitmentRules,
      METHODOLOGY_SECTION_IDS.retentionRules,
      METHODOLOGY_SECTION_IDS.limitations,
      METHODOLOGY_SECTION_IDS.technicalDetails,
    ]);
    expect(METHODOLOGY_NAV_ITEMS).toHaveLength(7);
  });

  it("documents prototype caveats for recruitment and retention", () => {
    expect(RECRUITMENT_METRICS.recruitmentAttention.limitation).toMatch(
      /does not prove that a county has a foster-home shortage/i,
    );
    expect(RETENTION_METRICS.outreachPriority.limitation).toMatch(/does not predict/i);
  });

  it("uses a dynamic reporting date in the methodology intro", () => {
    expect(buildMethodologyIntroDescription()).toContain("July 1, 2026");
    expect(buildMethodologyIntroDescription()).not.toContain("assessment build");
  });

  it("builds staff-facing retention rules from shared thresholds", () => {
    const rules = buildStaffFacingRetentionOutreachRules();
    expect(rules.high[0]).toContain("180 days");
    expect(rules.medium[0]).toContain("90 days");
    expect(rules.low[0]).toContain("No High or Medium outreach rule applies");
  });

  it("documents comparison minimum policy note in technical planning notes", () => {
    expect(PROTOTYPE_PLANNING_RULES_INTRO).toContain("were not supplied by DCFS");
    expect(IMPORTANT_THINGS_TO_KNOW.join(" ")).toContain("not official DCFS classifications");
  });
});
