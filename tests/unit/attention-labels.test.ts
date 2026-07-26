import { describe, expect, it } from "vitest";

import {
  formatOutreachPriorityAccessibleLabel,
  formatOutreachPriorityBadgeLabel,
  formatOutreachPriorityMetricCountLabel,
  getOutreachPriorityBadgeTitle,
} from "@/lib/retention/attention-labels";

describe("outreach priority labels", () => {
  it("uses compact visible badge labels for dense tables", () => {
    expect(formatOutreachPriorityBadgeLabel("High")).toBe("High outreach");
    expect(formatOutreachPriorityBadgeLabel("Medium")).toBe("Medium outreach");
    expect(formatOutreachPriorityBadgeLabel("Low")).toBe("Low outreach");
  });

  it("uses complete accessible labels for badge triggers", () => {
    expect(formatOutreachPriorityAccessibleLabel("High")).toBe(
      "High suggested outreach priority",
    );
  });

  it("keeps full tooltip titles and metric-card labels separate from badge text", () => {
    expect(getOutreachPriorityBadgeTitle("High")).toBe("High suggested outreach");
    expect(formatOutreachPriorityMetricCountLabel("High")).toBe(
      "High-priority outreach providers",
    );
  });
});
