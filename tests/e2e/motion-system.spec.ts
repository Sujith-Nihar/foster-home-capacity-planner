import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

const SCREENSHOT_DIR = path.join("tests", "e2e", "__screenshots__", "motion-system");

const INTRO_ROUTES = [
  { path: "/", heading: /Translate foster-home data into clear action/i, screenshot: "overview-introduction.png" },
  { path: "/recruitment", heading: /Focus recruitment where children/i, screenshot: "recruitment-introduction.png" },
  { path: "/retention", heading: /Support the foster homes/i, screenshot: "retention-introduction.png" },
  { path: "/methodology", heading: /Understand how metrics are defined/i, screenshot: "methodology-introduction.png" },
] as const;

async function underlineOffset(page: Page) {
  return page.locator(".hand-drawn-underline-path").first().evaluate((node) =>
    Number.parseFloat(window.getComputedStyle(node as SVGPathElement).strokeDashoffset),
  );
}

async function waitForUnderlineComplete(page: Page) {
  await page.waitForFunction(() => {
    const svgPath = document.querySelector(".hand-drawn-underline-path") as SVGPathElement | null;
    if (!svgPath) {
      return true;
    }
    if (!svgPath.classList.contains("hand-drawn-underline-path--drawn")) {
      return false;
    }
    const offset = Number.parseFloat(window.getComputedStyle(svgPath).strokeDashoffset);
    return offset <= 0.05;
  });
}

async function expectNoConsoleErrors(page: Page, routes: string[]) {
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

  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
  }

  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
}

test.describe("motion system", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const route of INTRO_ROUTES) {
    test(`PageIntroduction renders on ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator(".page-intro")).toBeVisible();
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await expect(page.locator(".page-intro .fi-text-reveal").first()).toBeVisible();
      await waitForUnderlineComplete(page);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, route.screenshot),
        fullPage: false,
      });
    });
  }

  test("underline begins undrawn and completes once", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const underlinePath = page.locator(".hand-drawn-underline-path").first();
    await expect(underlinePath).toHaveCount(1);

    const initialState = await underlinePath.evaluate((node) => ({
      offset: Number.parseFloat(window.getComputedStyle(node as SVGPathElement).strokeDashoffset),
      drawn: node.classList.contains("hand-drawn-underline-path--drawn"),
    }));

    expect(initialState.drawn).toBe(false);
    expect(initialState.offset).toBeGreaterThan(0.5);

    await waitForUnderlineComplete(page);

    const completedOffset = await underlineOffset(page);
    expect(completedOffset).toBeLessThanOrEqual(0.05);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "overview-underline-complete.png"),
      fullPage: false,
    });
  });

  test("introduction does not replay after retention filter or pagination changes", async ({
    page,
  }) => {
    await page.goto("/retention?priority=High&pageSize=10");
    await page.waitForLoadState("networkidle");
    await waitForUnderlineComplete(page);

    const dashoffsetAfterComplete = await underlineOffset(page);
    expect(dashoffsetAfterComplete).toBeLessThanOrEqual(0.05);

    const moreFilters = page.getByRole("button", { name: /More filters/i });
    await expect(moreFilters).toBeVisible();
    await moreFilters.click();
    await page.waitForTimeout(300);

    const dashoffsetAfterDisclosure = await underlineOffset(page);
    expect(dashoffsetAfterDisclosure).toBeLessThanOrEqual(0.05);

    await page.goto("/retention?priority=High&pageSize=10&page=2");
    await page.waitForLoadState("networkidle");
    await waitForUnderlineComplete(page);
    const dashoffsetAfterPagination = await underlineOffset(page);
    expect(dashoffsetAfterPagination).toBeLessThanOrEqual(0.05);
  });

  test("operational tables and filters have no entrance reveal classes", async ({ page }) => {
    for (const route of ["/recruitment", "/retention"]) {
      await page.goto(route);
      const operationalSurface = page.locator(".operational-filter-panel").first();
      await expect(operationalSurface).toBeVisible();
      await expect(operationalSurface.locator(".fi-text-reveal--enhanced")).toHaveCount(0);
      await expect(operationalSurface.locator(".fi-section-reveal--enhanced")).toHaveCount(0);

      const tableRows = page.locator(".data-table-viewport tbody tr");
      if ((await tableRows.count()) > 0) {
        await expect(tableRows.first().locator(".fi-text-reveal, .fi-section-reveal")).toHaveCount(0);
      }
    }
  });

  test("filters remain immediately usable", async ({ page }) => {
    await page.goto("/recruitment");
    const apply = page.getByRole("button", { name: "Apply filters" });
    const control = page.locator(".operational-filter-control").first();
    await expect(apply).toBeEnabled();
    await expect(control).toBeVisible();
    await control.click();
  });

  test("reduced motion shows introduction content immediately", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Translate foster-home data into clear action/i }),
    ).toBeVisible();

    const opacity = await page
      .locator(".page-intro .fi-text-reveal")
      .first()
      .evaluate((el) => window.getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThan(0.9);

    const offset = await underlineOffset(page);
    expect(offset).toBeLessThanOrEqual(0.05);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "overview-reduced-motion.png"),
      fullPage: false,
    });
  });

  test("county and provider briefings render without decorative underline", async ({ page }) => {
    await page.goto("/recruitment/Cook");
    await expect(page.getByRole("heading", { name: /Cook County/i })).toBeVisible();
    await expect(page.locator(".hand-drawn-underline-path")).toHaveCount(0);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "county-briefing.png"),
      fullPage: false,
    });

    await page.goto("/providers/500021");
    await expect(page.getByRole("heading", { name: /Provider 500021/i })).toBeVisible();
    await expect(page.locator(".hand-drawn-underline-path")).toHaveCount(0);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "provider-briefing.png"),
      fullPage: false,
    });
  });

  test("mobile recruitment and retention introductions render", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/recruitment");
    await expect(page.locator(".page-intro")).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "recruitment-mobile.png"),
      fullPage: false,
    });

    await page.goto("/retention");
    await expect(page.locator(".page-intro")).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "retention-mobile.png"),
      fullPage: false,
    });
  });

  test("has no hydration warnings, console errors, or failed chunk requests", async ({ page }) => {
    await expectNoConsoleErrors(page, ["/", "/recruitment", "/retention", "/methodology"]);
  });
});
