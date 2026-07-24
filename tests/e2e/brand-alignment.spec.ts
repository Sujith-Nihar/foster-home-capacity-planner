import { test, expect } from "@playwright/test";
import path from "node:path";

const SCREENSHOT_DIR = path.join("tests", "e2e", "__screenshots__", "brand-alignment");

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

test.describe("brand alignment", () => {
  test("overview introduction and dark attention section render", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Translate foster-home data into clear action/i }),
    ).toBeVisible();
    await expect(page.getByText("ILLINOIS CAPACITY OVERVIEW")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What needs attention" })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "overview-introduction.png"),
      fullPage: false,
    });
  });

  test("hand-drawn underline completes and reduced motion shows content immediately", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1600);

    const underline = page.locator(".hand-drawn-underline-path").first();
    await expect(underline).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "overview-underline-complete.png"),
      fullPage: false,
    });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: /Translate foster-home data into clear action/i }),
    ).toBeVisible();
    await expect(page.locator(".fi-section-reveal").first()).toBeVisible();
  });

  test("recruitment table exposes visible View county actions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recruitment");

    await expect(page.getByRole("link", { name: "View county" }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "recruitment-table.png"),
      fullPage: false,
    });
  });

  test("retention table exposes visible View provider actions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/retention");

    await expect(page.getByRole("link", { name: "View provider" }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "retention-table.png"),
      fullPage: false,
    });
  });

  test("mobile navigation is keyboard accessible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "Open navigation" });
    await expect(menuButton).toBeVisible();
    await menuButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: "Recruitment", exact: true })).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "mobile-navigation.png"),
      fullPage: false,
    });
  });

  test("mobile recruitment and retention cards render without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/recruitment");
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "recruitment-mobile-card.png"),
      fullPage: false,
    });

    await page.goto("/retention");
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "retention-mobile-card.png"),
      fullPage: false,
    });
  });

  test("has no console errors or failed chunk requests", async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText;
      if (failure === "net::ERR_ABORTED") {
        return;
      }
      failedRequests.push(`${request.method()} ${request.url()} - ${failure}`);
    });

    for (const route of ["/", "/recruitment", "/retention", "/methodology"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
    }

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
