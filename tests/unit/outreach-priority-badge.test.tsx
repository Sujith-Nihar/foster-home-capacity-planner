import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OutreachPriorityBadge } from "@/components/retention/outreach-priority-badge";

describe("OutreachPriorityBadge", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows compact visible text with a complete accessible label", () => {
    render(<OutreachPriorityBadge priority="High" primaryReason="License ends soon" />);

    const trigger = screen.getByRole("button", {
      name: "High suggested outreach priority. Show explanation.",
    });
    expect(trigger).toHaveTextContent("High outreach");
    expect(trigger).toHaveClass("outreach-priority-badge-trigger");
    expect(trigger.querySelector(".outreach-priority-badge")).not.toBeNull();
  });
});
