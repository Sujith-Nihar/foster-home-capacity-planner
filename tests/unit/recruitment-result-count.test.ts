import { describe, expect, it } from "vitest";

import { buildRecruitmentResultMessage } from "@/components/recruitment/recruitment-result-count";

describe("RecruitmentResultCount messaging", () => {
  it("reflects the active comparison-status filter", () => {
    expect(buildRecruitmentResultMessage(52, "eligible")).toBe("52 eligible counties shown");
    expect(buildRecruitmentResultMessage(102, "all")).toBe("102 counties shown");
    expect(buildRecruitmentResultMessage(8, "limited")).toBe("8 limited-data counties shown");
    expect(buildRecruitmentResultMessage(0, "eligible")).toBe("No eligible counties shown");
  });
});
