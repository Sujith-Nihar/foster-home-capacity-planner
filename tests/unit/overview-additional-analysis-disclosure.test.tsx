import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ADDITIONAL_STATEWIDE_ANALYSIS_CONTENT_ID,
  OverviewAdditionalAnalysisDisclosure,
} from "@/components/overview/overview-additional-analysis-disclosure";

describe("OverviewAdditionalAnalysisDisclosure", () => {
  it("toggles panel visibility, label, and aria state", () => {
    render(
      <OverviewAdditionalAnalysisDisclosure heading={<h2>Additional statewide analysis</h2>}>
        <p>Additional chart content</p>
      </OverviewAdditionalAnalysisDisclosure>,
    );

    const toggle = screen.getByRole("button", { name: "Show analysis" });
    const panel = document.getElementById(ADDITIONAL_STATEWIDE_ANALYSIS_CONTENT_ID);

    expect(panel).not.toBeNull();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", ADDITIONAL_STATEWIDE_ANALYSIS_CONTENT_ID);
    expect(panel).toHaveAttribute("hidden");
    expect(screen.queryByText("Additional chart content")).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Hide analysis" })).toBe(toggle);
    expect(panel).not.toHaveAttribute("hidden");
    expect(screen.getByText("Additional chart content")).toBeVisible();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Show analysis" })).toBe(toggle);
    expect(panel).toHaveAttribute("hidden");
    expect(screen.queryByText("Additional chart content")).not.toBeInTheDocument();
  });
});
