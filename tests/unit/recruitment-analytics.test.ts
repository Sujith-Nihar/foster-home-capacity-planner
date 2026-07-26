import { describe, expect, it } from "vitest";

import { formatAgeGroupPressureTakeaway } from "@/lib/recruitment/analytics";
import type { AgeGroupPressureDto } from "@/lib/recruitment/analytics";

const sampleAgeGroup = (
  overrides: Partial<AgeGroupPressureDto> = {},
): AgeGroupPressureDto => ({
  ageGroup: "0–5",
  fosterChildren: 100,
  matchingActiveProviders: 20,
  childrenPerMatchingActiveProvider: 5,
  ...overrides,
});

describe("formatAgeGroupPressureTakeaway", () => {
  it("returns a dynamic takeaway for the highest-pressure age group", () => {
    const takeaway = formatAgeGroupPressureTakeaway([
      sampleAgeGroup({ ageGroup: "13–17", childrenPerMatchingActiveProvider: 6.2 }),
      sampleAgeGroup({ ageGroup: "6–12", childrenPerMatchingActiveProvider: 4.1 }),
    ]);

    expect(takeaway).toBe(
      "Ages 13–17 have the highest statewide pressure relative to matching engaged providers.",
    );
  });

  it("handles tied highest-pressure age groups", () => {
    const takeaway = formatAgeGroupPressureTakeaway([
      sampleAgeGroup({ ageGroup: "13–17", childrenPerMatchingActiveProvider: 6.2 }),
      sampleAgeGroup({ ageGroup: "6–12", childrenPerMatchingActiveProvider: 6.2 }),
      sampleAgeGroup({ ageGroup: "0–5", childrenPerMatchingActiveProvider: 3.1 }),
    ]);

    expect(takeaway).toBe(
      "Ages 13–17 and 6–12 have the highest statewide pressure relative to matching engaged providers.",
    );
  });
});
