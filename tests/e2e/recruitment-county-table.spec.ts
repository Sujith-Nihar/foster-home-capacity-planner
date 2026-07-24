import { test, expect, type Locator, type Page } from "@playwright/test";

const DESKTOP_VIEWPORTS = [1440, 1280] as const;
const TABLET_VIEWPORTS = [1024, 768] as const;
const MOBILE_VIEWPORT = 390;

function desktopBreakdownButton(page: Page) {
  return page
    .locator(".table-desktop-only")
    .first()
    .getByRole("button", { name: /View breakdown|Hide breakdown/i });
}

function mobileBreakdownButton(page: Page) {
  return page
    .locator(".table-mobile-only")
    .first()
    .getByRole("button", { name: /View breakdown|Hide breakdown/i });
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function expectControlFullyInsideContainer(control: Locator, container: Locator) {
  const controlBox = await control.boundingBox();
  const containerBox = await container.boundingBox();

  expect(controlBox).not.toBeNull();
  expect(containerBox).not.toBeNull();

  expect(controlBox!.width).toBeGreaterThan(0);
  expect(controlBox!.height).toBeGreaterThanOrEqual(34);
  expect(controlBox!.x).toBeGreaterThanOrEqual(containerBox!.x - 1);
  expect(controlBox!.x + controlBox!.width).toBeLessThanOrEqual(
    containerBox!.x + containerBox!.width + 1,
  );
}

test.describe("recruitment county table interactions", () => {
  test("expands and collapses a county age breakdown", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recruitment");

    const expandButton = desktopBreakdownButton(page).first();
    await expect(expandButton).toBeVisible();
    await expect(expandButton).toBeEnabled();
    await expect(expandButton).toHaveAttribute("aria-expanded", "false");

    await expandButton.click();
    await expect(expandButton).toHaveAttribute("aria-expanded", "true");
    await expect(expandButton).toHaveAccessibleName("Hide breakdown");

    const breakdown = page.getByRole("region", { name: /Age-group breakdown for/i }).first();
    await expect(breakdown).toBeVisible();
    await expect(breakdown.getByRole("columnheader", { name: "Age group" })).toBeVisible();
    await expect(breakdown.getByText("Ages 0–5")).toBeVisible();
    await expect(breakdown.getByText("Ages 6–12")).toBeVisible();
    await expect(breakdown.getByText("Ages 13–17")).toBeVisible();
    await expect(breakdown.getByRole("link", { name: /View complete county page/i })).toBeVisible();

    await expandButton.click();
    await expect(expandButton).toHaveAttribute("aria-expanded", "false");
    await expect(expandButton).toHaveAccessibleName("View breakdown");
    await expect(page.getByRole("region", { name: /Age-group breakdown for/i })).toHaveCount(0);
  });

  test("keeps only one county breakdown open at a time", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recruitment");

    const expandButtons = desktopBreakdownButton(page);
    const firstButton = expandButtons.nth(0);
    const secondButton = expandButtons.nth(1);

    await firstButton.click();
    await expect(page.getByRole("region", { name: /Age-group breakdown for/i })).toHaveCount(1);

    await secondButton.click();
    await expect(page.getByRole("region", { name: /Age-group breakdown for/i })).toHaveCount(1);
    await expect(firstButton).toHaveAttribute("aria-expanded", "false");
    await expect(secondButton).toHaveAttribute("aria-expanded", "true");
  });

  test("shows at least five county summary rows on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recruitment");

    const countyLinks = page.locator(".table-desktop-only tbody tr a[href^='/recruitment/']");
    await expect(countyLinks.first()).toBeVisible();
    expect(await countyLinks.count()).toBeGreaterThanOrEqual(5);
  });

  test("supports keyboard activation of the breakdown control", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recruitment");

    const expandButton = desktopBreakdownButton(page).first();
    await expandButton.focus();
    await expect(expandButton).toBeFocused();
    await page.keyboard.press("Space");
    await expect(expandButton).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(expandButton).toHaveAttribute("aria-expanded", "false");
  });
});

for (const width of DESKTOP_VIEWPORTS) {
  test.describe(`recruitment breakdown button at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("shows a fully visible breakdown button without page overflow", async ({ page }) => {
      await page.goto("/recruitment");

      const tableFrame = page.locator(".data-table-frame").first();
      const breakdownButton = desktopBreakdownButton(page).first();

      await expect(tableFrame).toBeVisible();
      await expect(breakdownButton).toBeVisible();
      await expect(breakdownButton).toBeEnabled();
      await expect(breakdownButton).toHaveText("View breakdown");
      await expectControlFullyInsideContainer(breakdownButton, tableFrame);
      await expectNoDocumentHorizontalOverflow(page);
    });

    test("keeps expanded breakdown inside the table without page overflow", async ({ page }) => {
      await page.goto("/recruitment");

      const breakdownButton = desktopBreakdownButton(page).first();
      await breakdownButton.click();

      const breakdown = page.getByRole("region", { name: /Age-group breakdown for/i }).first();
      const tableFrame = page.locator(".data-table-frame").first();

      await expect(breakdown).toBeVisible();
      await expectControlFullyInsideContainer(breakdown, tableFrame);
      await expectNoDocumentHorizontalOverflow(page);
    });
  });
}

for (const width of TABLET_VIEWPORTS) {
  test.describe(`recruitment breakdown button at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("shows a fully visible breakdown button", async ({ page }) => {
      await page.goto("/recruitment");

      const tableFrame = page.locator(".data-table-frame").first();
      const breakdownButton = desktopBreakdownButton(page).first();

      await expect(breakdownButton).toBeVisible();
      await expect(breakdownButton).toHaveText("View breakdown");
      await expectControlFullyInsideContainer(breakdownButton, tableFrame);
      await expectNoDocumentHorizontalOverflow(page);
    });
  });
}

test.describe("recruitment breakdown at mobile width", () => {
  test.use({ viewport: { width: MOBILE_VIEWPORT, height: 844 } });

  test("uses county cards with a visible breakdown button", async ({ page }) => {
    await page.goto("/recruitment");

    await expect(page.locator(".table-mobile-only").first()).toBeVisible();
    await expect(page.locator(".table-desktop-only").first()).toBeHidden();

    const breakdownButton = mobileBreakdownButton(page).first();
    await expect(breakdownButton).toBeVisible();
    await expect(breakdownButton).toBeEnabled();
    await expect(breakdownButton).toHaveText("View breakdown");
    await expectNoDocumentHorizontalOverflow(page);
  });
});
