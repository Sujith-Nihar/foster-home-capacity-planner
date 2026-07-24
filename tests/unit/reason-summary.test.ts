import { describe, expect, it } from "vitest";

import { formatOutreachReasonForDisplay } from "@/components/shared/reason-summary";

const baseContext = {
  daysSinceLastPlacement: 194,
  daysUntilExpiration: 14,
  currentlyHasPlacement: false,
  engagementRateLast365: 0.12,
};

describe("formatOutreachReasonForDisplay", () => {
  it("uses actual inactivity days for threshold reasons", () => {
    expect(formatOutreachReasonForDisplay("Inactive for at least 180 days", baseContext)).toBe(
      "Inactive for 194 days",
    );
  });

  it("shortens combined inactivity and license timing reasons", () => {
    expect(
      formatOutreachReasonForDisplay(
        "Inactive with license expiring within 90 days and inactive for at least 60 days",
        baseContext,
      ),
    ).toBe("Inactive and license ends in 14 days");
  });

  it("maps engagement reasons to staff-friendly language", () => {
    expect(
      formatOutreachReasonForDisplay(
        "Engagement below 25% with at least 90 eligible licensed days",
        baseContext,
      ),
    ).toBe("Limited activity during the previous year");
  });

  it("keeps active license timing readable", () => {
    expect(
      formatOutreachReasonForDisplay(
        "Currently active with license expiring within 60 days",
        { ...baseContext, currentlyHasPlacement: true },
      ),
    ).toBe("Currently active, but license ends within 60 days");
  });
});
