import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const DESKTOP_OVERFLOW_ROUTES = [
  "/",
  "/recruitment",
  "/retention",
  "/recruitment/Cook",
  "/providers/500001",
  "/methodology",
] as const;

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

for (const viewport of VIEWPORTS) {
  test.describe(`responsive layout (${viewport.name})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("renders overview and navigation without horizontal overflow", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });

    test("renders retention table region", async ({ page }) => {
      await page.goto("/retention");
      await expect(
        page.getByRole("heading", { name: "Licensed provider outreach list" }),
      ).toBeVisible();
    });
  });
}

test.describe("desktop horizontal overflow", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  for (const route of DESKTOP_OVERFLOW_ROUTES) {
    test(`has no page-level horizontal scroll on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe("desktop horizontal overflow at 1440px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("recruitment table fits without page-level horizontal scroll", async ({ page }) => {
    await page.goto("/recruitment");
    await expect(page.getByRole("heading", { name: "Recruitment", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
