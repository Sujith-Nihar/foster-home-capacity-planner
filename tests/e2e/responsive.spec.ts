import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`responsive layout (${viewport.name})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("renders overview and navigation without horizontal overflow", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test("renders retention table region", async ({ page }) => {
      await page.goto("/retention");
      await expect(
        page.getByRole("heading", { name: "Licensed provider outreach list" }),
      ).toBeVisible();
    });
  });
}
