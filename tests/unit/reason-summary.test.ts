import { describe, expect, it } from "vitest";

import { formatOutreachReasonForDisplay } from "@/components/shared/reason-summary";

const baseContext = {
  daysSinceLastPlacement: 194,
  daysUntilExpiration: 14,
  currentlyHasPlacement: false,
  engagementRateLast365: 0.12,
};

describe("formatOutreachReasonForDisplay", () => {
  it("uses staff-friendly language for extended inactivity", () => {
    expect(formatOutreachReasonForDisplay("Inactive for at least 180 days", baseContext)).toBe(
      "No placement activity for an extended period",
    );
  });

  it("shortens combined inactivity and license timing reasons", () => {
    expect(
      formatOutreachReasonForDisplay(
        "Inactive with license expiring within 90 days and inactive for at least 60 days",
        baseContext,
      ),
    ).toBe("No current placement and license ends in 14 days");
  });

  it("maps engagement reasons to staff-friendly language", () => {
    expect(
      formatOutreachReasonForDisplay(
        "Engagement below 25% with at least 90 eligible licensed days",
        baseContext,
      ),
    ).toBe("Limited placement activity during the past 12 months");
  });

  it("keeps active license timing readable", () => {
    expect(
      formatOutreachReasonForDisplay(
        "Currently active with license expiring within 60 days",
        { ...baseContext, currentlyHasPlacement: true },
      ),
    ).toBe("Has a current placement, but license ends soon");
  });
});
