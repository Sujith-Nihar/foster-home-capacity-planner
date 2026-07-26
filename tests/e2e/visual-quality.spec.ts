import { test, expect } from "@playwright/test";

import { FOSTER_INSIGHTS_LOGO_INTRINSIC } from "@/components/layout/foster-insights-logo";

const SCREENSHOT_DIR = "tests/e2e/__screenshots__/visual-quality";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

test.describe("visual quality repair", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("logo renders with transparent wrapper and correct ratio", async ({ page }) => {
    await page.goto("/");

    const logo = page.getByRole("img", { name: "Foster Insights" });
    await expect(logo).toBeVisible();

    const wrapperBg = await page.locator(".app-header-logo-link").evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(wrapperBg).toBe("rgba(0, 0, 0, 0)");

    const imageBg = await logo.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(imageBg).toBe("rgba(0, 0, 0, 0)");

    const box = await logo.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const ratio = box.width / box.height;
      expect(Math.abs(ratio - FOSTER_INSIGHTS_LOGO_INTRINSIC.aspectRatio)).toBeLessThan(0.15);
    }

    await page.locator(".app-header").screenshot({ path: `${SCREENSHOT_DIR}/header-1440.png` });
  });

  test("statewide metrics remain inside content container", async ({ page }) => {
    await page.goto("/");

    const container = page.locator(".overview-metrics");
    await expect(container).toBeVisible();

    const containerBox = await container.boundingBox();
    const rightCard = page.locator(".overview-metrics__grid .overview-metric-card").nth(2);
    const cardBox = await rightCard.boundingBox();

    expect(containerBox).not.toBeNull();
    expect(cardBox).not.toBeNull();

    if (containerBox && cardBox) {
      expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width + 1);
    }

    await container.screenshot({ path: `${SCREENSHOT_DIR}/statewide-metrics-1440.png` });
    await expectNoHorizontalOverflow(page);
  });

  test("dark attention buttons have visible readable text", async ({ page }) => {
    await page.goto("/");

    const primary = page.locator(".fi-btn-dark-primary", { hasText: "Review retention" });
    const secondary = page.locator(".fi-btn-dark-secondary", { hasText: "Explore recruitment" });

    await expect(primary).toBeVisible();
    await expect(secondary).toBeVisible();
    await expect(primary).toContainText("Review retention");
    await expect(secondary).toContainText("Explore recruitment");

    const primaryColor = await primary.evaluate((el) => window.getComputedStyle(el).color);
    const primaryBg = await primary.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(primaryBg).not.toBe(primaryColor);

    await page.locator(".fi-dark-section").screenshot({ path: `${SCREENSHOT_DIR}/attention-section-1440.png` });
  });

  test("reduced motion keeps overview text visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Translate foster-home data into clear action/i }),
    ).toBeVisible();
    await expect(page.getByText("Statewide snapshot")).toBeVisible();

    const opacity = await page.locator(".fi-text-reveal").first().evaluate((el) => window.getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThan(0.9);
  });

  test("captures overview desktop and mobile screenshots", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/overview-desktop-1440.png`, fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/overview-mobile-390.png`, fullPage: true });
  });
});
