import { describe, expect, it } from "vitest";

import {
  formatRecruitmentAttentionAccessibleLabel,
  formatRecruitmentAttentionBadgeLabel,
  getRecruitmentAttentionBadgeExplanation,
  getRecruitmentAttentionBadgeLevel,
  getRecruitmentAttentionBadgeTitle,
} from "@/lib/recruitment/attention-labels";

describe("recruitment attention labels", () => {
  it("uses complete accessible labels", () => {
    expect(formatRecruitmentAttentionAccessibleLabel("High", false)).toBe(
      "High suggested recruitment attention",
    );
    expect(formatRecruitmentAttentionAccessibleLabel("Not scored", true)).toBe("Limited data");
  });

  it("supports compact badge labels in constrained table cells", () => {
    expect(formatRecruitmentAttentionBadgeLabel("Medium", false, "compact")).toBe("Medium attention");
    expect(formatRecruitmentAttentionBadgeLabel("High", false, "full")).toBe(
      "High suggested recruitment attention",
    );
    expect(formatRecruitmentAttentionBadgeLabel("Not scored", true, "full")).toBe("Limited data");
  });

  it("maps limited-data counties to the limited badge level", () => {
    expect(getRecruitmentAttentionBadgeLevel("Not scored", true)).toBe("limited");
    expect(getRecruitmentAttentionBadgeLevel("High", false)).toBe("high");
  });

  it("provides concise badge tooltip titles and explanations", () => {
    expect(getRecruitmentAttentionBadgeTitle("High", false)).toBe("High recruitment attention");
    expect(getRecruitmentAttentionBadgeExplanation("High", false)).toBe(
      "At least 2 of the 3 recruitment signals rank among the highest quarter of comparable counties.",
    );
    expect(getRecruitmentAttentionBadgeExplanation("Medium", false)).toContain(
      "One recruitment signal ranks in the highest quarter",
    );
    expect(getRecruitmentAttentionBadgeExplanation("Low", false)).toContain(
      "does not meet the High or Medium recruitment-attention rules",
    );
    expect(getRecruitmentAttentionBadgeExplanation("Not scored", true)).toBe(
      "This county does not have enough children or engaged providers for a stable comparison.",
    );
  });
});
