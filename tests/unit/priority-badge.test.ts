import { describe, expect, it } from "vitest";

import { priorityToAttentionLevel } from "@/components/priority-badge";

describe("priority badge helpers", () => {
  it("maps recruitment and outreach priorities to attention levels", () => {
    expect(priorityToAttentionLevel("High")).toBe("high");
    expect(priorityToAttentionLevel("Medium")).toBe("medium");
    expect(priorityToAttentionLevel("Low")).toBe("low");
    expect(priorityToAttentionLevel("Limited data")).toBe("limited");
  });
});
