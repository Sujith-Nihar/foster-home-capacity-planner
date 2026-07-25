import { test, expect } from "@playwright/test";

test.describe("application states", () => {
  test("shows not-found states for invalid drill-down routes", async ({ page }) => {
    await page.goto("/recruitment/NotARealCountyXYZ");
    await expect(page.getByRole("heading", { name: "County not found" })).toBeVisible();

    await page.goto("/providers/not-a-provider");
    await expect(page.getByRole("heading", { name: "Provider not found" })).toBeVisible();
  });

  test("shows empty filtered retention results", async ({ page }) => {
    await page.goto("/retention?providerId=999999999");
    await expect(
      page.getByRole("status").filter({ hasText: "No licensed providers match the selected filters." }).first(),
    ).toBeVisible();
  });
});
