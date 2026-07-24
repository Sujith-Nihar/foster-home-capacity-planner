import { describe, expect, it } from "vitest";

import {
  formatAdditionalFactorsLabel,
  summarizeRecruitmentReason,
} from "@/lib/recruitment/summary-labels";

describe("recruitment summary labels", () => {
  it("uses plain language for percentile-based out-of-county reasons", () => {
    expect(
      summarizeRecruitmentReason(
        "Above the 75th percentile statewide for out-of-county foster-home placement rate",
      ),
    ).toBe("Higher out-of-county placement rate than most comparable counties");
  });

  it("uses plain language for children-per-provider reasons", () => {
    expect(
      summarizeRecruitmentReason(
        "Above the 75th percentile statewide for children per active provider",
      ),
    ).toBe("More children per engaged provider than most comparable counties");
  });

  it("formats additional factor counts", () => {
    expect(formatAdditionalFactorsLabel(3)).toBe("+3 additional factors");
    expect(formatAdditionalFactorsLabel(1)).toBe("+1 additional factor");
  });
});
