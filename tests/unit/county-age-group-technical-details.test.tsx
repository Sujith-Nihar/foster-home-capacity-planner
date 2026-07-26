import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountyAgeGroupTechnicalDetails } from "@/components/recruitment/county-age-group-technical-details";
import type { CountyAgeMetricsDto } from "@/lib/types/domain";

const ageGroups = [
  {
    county: "Cook",
    ageGroup: "0–5",
    reportingDate: "2026-07-01",
    currentFosterHomeChildren: 100,
    matchingLicensedProviders: 40,
    matchingActiveProviders: 30,
    childrenPerMatchingActiveProvider: 3.33,
  },
] as CountyAgeMetricsDto[];

describe("CountyAgeGroupTechnicalDetails", () => {
  it("toggles the technical comparison table with accessible footer control labels", () => {
    render(
      <CountyAgeGroupTechnicalDetails
        ageGroups={ageGroups}
        benchmarkByAgeGroup={
          new Map([
            [
              "0–5",
              {
                ageGroup: "0–5",
                median: 2.5,
                p75: 3.5,
              },
            ],
          ])
        }
      />,
    );

    const toggle = screen.getByRole("button", { name: "Show technical comparison details" });
    const panelId = toggle.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;

    expect(panel).not.toBeNull();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");
    expect(screen.queryByText("Matching licensed providers")).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Hide technical comparison details" })).toBe(toggle);
    expect(panel).not.toHaveAttribute("hidden");
    expect(screen.getByText("Matching licensed providers")).toBeVisible();
    expect(screen.getByText("Exact typical comparable-county value")).toBeVisible();
    expect(screen.getByText("Exact top-quarter benchmark")).toBeVisible();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Show technical comparison details" })).toBe(toggle);
    expect(panel).toHaveAttribute("hidden");
  });
});
