import { describe, expect, it } from "vitest";

import {
  countyMatchesSearch,
  filterCountiesBySearch,
  filterCountySuggestions,
  normalizeCountySearchQuery,
} from "@/lib/filters/county-search";

describe("county search", () => {
  it("normalizes county suffixes, punctuation, and whitespace", () => {
    expect(normalizeCountySearchQuery("  Cook County  ")).toBe("cook");
    expect(normalizeCountySearchQuery("St. Clair")).toBe("stclair");
    expect(normalizeCountySearchQuery("st clair")).toBe("stclair");
    expect(normalizeCountySearchQuery("lasalle")).toBe("lasalle");
  });

  it("matches counties with partial and case-insensitive search", () => {
    expect(countyMatchesSearch("Cook", "cook")).toBe(true);
    expect(countyMatchesSearch("Cook", "Cook County")).toBe(true);
    expect(countyMatchesSearch("St. Clair", "st clair")).toBe(true);
    expect(countyMatchesSearch("LaSalle", "lasalle")).toBe(true);
    expect(countyMatchesSearch("Cook", "will")).toBe(false);
  });

  it("filters county rows using normalized contains matching", () => {
    const counties = [
      { county: "Cook" },
      { county: "St. Clair" },
      { county: "LaSalle" },
    ];

    expect(filterCountiesBySearch(counties, "cook")).toEqual([{ county: "Cook" }]);
    expect(filterCountiesBySearch(counties, "st clair")).toEqual([{ county: "St. Clair" }]);
    expect(filterCountiesBySearch(counties, undefined)).toEqual(counties);
  });

  it("returns a small local suggestion list", () => {
    const counties = ["Cook", "Coles", "Clinton", "St. Clair", "LaSalle"];
    expect(filterCountySuggestions(counties, "co")).toEqual(["Cook", "Coles"]);
    expect(filterCountySuggestions(counties, "st clair")).toEqual(["St. Clair"]);
  });
});
