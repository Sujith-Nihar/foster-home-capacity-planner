import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("foundation routes", () => {
  test("overview route loads with noindex metadata", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Overview", exact: true }),
    ).toBeVisible();

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toMatch(/noindex/i);
    expect(robots).toMatch(/nofollow/i);
  });

  test("primary navigation routes are reachable", async ({ page }) => {
    await page.goto("/");

    for (const label of ["Recruitment", "Retention", "Methodology"]) {
      await page.getByRole("link", { name: label, exact: true }).click();
      await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
    }
  });

  test("overview passes basic axe checks", async ({ page }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
