import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AdditionalOutreachFactors } from "@/components/retention/additional-outreach-factors";

describe("AdditionalOutreachFactors", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a single button trigger without nested interactive elements", () => {
    render(
      <AdditionalOutreachFactors
        reasons={["No current placement and license ends in 14 days"]}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);

    const trigger = screen.getByRole("button", {
      name: "View 1 more factor. Show additional outreach factors.",
    });
    expect(trigger).toHaveTextContent("View 1 more factor");
    expect(trigger.querySelector("button")).toBeNull();
    expect(trigger.querySelector("a")).toBeNull();
  });

  it("uses plural trigger copy for multiple additional factors", () => {
    render(
      <AdditionalOutreachFactors
        reasons={[
          "Limited placement activity during the past 12 months",
          "No current placement and license ends in 14 days",
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: /View 2 more factors/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
