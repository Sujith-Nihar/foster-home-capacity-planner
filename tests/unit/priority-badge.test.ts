import { describe, expect, it } from "vitest";

import { priorityToAttentionLevel, suggestedAttentionToLevel } from "@/components/priority-badge";

describe("priority badge helpers", () => {
  it("maps recruitment priorities to attention levels", () => {
    expect(priorityToAttentionLevel("High")).toBe("high");
    expect(priorityToAttentionLevel("Medium")).toBe("medium");
    expect(priorityToAttentionLevel("Low")).toBe("low");
    expect(priorityToAttentionLevel("Limited data")).toBe("not-scored");
  });

  it("maps suggested attention labels to badge levels", () => {
    expect(suggestedAttentionToLevel("Not scored")).toBe("not-scored");
    expect(suggestedAttentionToLevel("High")).toBe("high");
  });
});
