import { describe, expect, it } from "vitest";

import {
  formatAdditionalFactorsLabel,
  summarizeRecruitmentReason,
} from "@/lib/recruitment/summary-labels";

describe("recruitment summary labels", () => {
  it("shortens percentile-based out-of-county reasons", () => {
    expect(
      summarizeRecruitmentReason(
        "Above the 75th percentile statewide for out-of-county foster-home placement rate",
      ),
    ).toBe("High out-of-county placement rate");
  });

  it("shortens children-per-provider reasons", () => {
    expect(
      summarizeRecruitmentReason(
        "Above the 75th percentile statewide for children per active provider",
      ),
    ).toBe("High children-per-provider ratio");
  });

  it("formats additional factor counts", () => {
    expect(formatAdditionalFactorsLabel(3)).toBe("+3 additional factors");
    expect(formatAdditionalFactorsLabel(1)).toBe("+1 additional factor");
  });
});
