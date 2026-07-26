import { test, expect, type Page } from "@playwright/test";

const SCROLL_TOLERANCE = 80;

async function scrollToFilterPanel(page: Page, headingId: string) {
  await page.evaluate((id) => {
    const heading = document.getElementById(id);
    if (!heading) {
      return;
    }
    const top = heading.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: Math.max(0, top) });
  }, headingId);
  await page.waitForTimeout(150);
}

async function getScrollY(page: Page) {
  return page.evaluate(() => window.scrollY);
}

async function clickWithoutScroll(locator: import("@playwright/test").Locator) {
  await locator.evaluate((element) => {
    (element as HTMLButtonElement).click();
  });
}

async function waitForFilterApply(page: Page) {
  await expect(page.getByRole("button", { name: "Apply filters" })).toBeEnabled();
}

async function underlineOffset(page: Page) {
  return page.locator(".hand-drawn-underline-path").first().evaluate((node) =>
    Number.parseFloat(window.getComputedStyle(node as SVGPathElement).strokeDashoffset),
  );
}

test.describe("operational filter navigation", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("recruitment apply preserves scroll position", async ({ page }) => {
    await page.goto("/recruitment");
    await scrollToFilterPanel(page, "recruitment-county-table-heading");
    const before = await getScrollY(page);

    await page.getByLabel("Search county").fill("cook");
    await clickWithoutScroll(page.getByRole("button", { name: "Apply filters" }));
    await waitForFilterApply(page);

    const after = await getScrollY(page);
    expect(Math.abs(after - before)).toBeLessThanOrEqual(SCROLL_TOLERANCE);
    await expect(page).toHaveURL(/county=cook/i);
    await expect(page.locator(".operational-filter-result-count").first()).toContainText(/county/i);
  });

  test("recruitment clear preserves scroll position", async ({ page }) => {
    await page.goto("/recruitment?county=Cook&priority=High");
    await scrollToFilterPanel(page, "recruitment-county-table-heading");
    const before = await getScrollY(page);

    await clickWithoutScroll(page.getByRole("button", { name: "Clear filters" }));
    await waitForFilterApply(page);

    const after = await getScrollY(page);
    expect(Math.abs(after - before)).toBeLessThanOrEqual(SCROLL_TOLERANCE);
    await expect(page).not.toHaveURL(/county=/);
  });

  test("retention apply preserves scroll position", async ({ page }) => {
    await page.goto("/retention");
    await scrollToFilterPanel(page, "retention-provider-table-heading");
    const before = await getScrollY(page);

    await page.getByLabel("Outreach priority").click();
    await page.getByRole("option", { name: "High" }).click();
    await clickWithoutScroll(page.getByRole("button", { name: "Apply filters" }));
    await waitForFilterApply(page);

    const after = await getScrollY(page);
    expect(Math.abs(after - before)).toBeLessThanOrEqual(SCROLL_TOLERANCE);
    await expect(page).toHaveURL(/priority=High/);
    await expect(page.locator(".operational-filter-result-count").first()).toContainText(/provider/i);
  });

  test("retention clear preserves scroll position", async ({ page }) => {
    await page.goto("/retention?priority=High&county=Cook");
    await scrollToFilterPanel(page, "retention-provider-table-heading");
    const before = await getScrollY(page);

    await clickWithoutScroll(page.getByRole("button", { name: "Clear filters" }));
    await waitForFilterApply(page);

    const after = await getScrollY(page);
    expect(Math.abs(after - before)).toBeLessThanOrEqual(SCROLL_TOLERANCE);
    await expect(page).not.toHaveURL(/priority=High/);
    await expect(page).not.toHaveURL(/county=Cook/);
  });

  test("county search supports partial matching and refresh", async ({ page }) => {
    await page.goto("/recruitment");
    await page.getByLabel("Search county").fill("cook");
    await clickWithoutScroll(page.getByRole("button", { name: "Apply filters" }));
    await waitForFilterApply(page);
    await expect(page).toHaveURL(/county=cook/i);

    await page.reload();
    await expect(page.getByLabel("Search county")).toHaveValue(/cook/i);
    await expect(page.locator(".operational-filter-result-count").first()).not.toContainText(
      /No eligible counties shown/i,
    );
  });

  test("enter applies recruitment filters without scrolling to top", async ({ page }) => {
    await page.goto("/recruitment");
    await scrollToFilterPanel(page, "recruitment-county-table-heading");
    const before = await getScrollY(page);

    await page.getByLabel("Search county").fill("Cook");
    await page.getByLabel("Search county").press("Enter");
    await waitForFilterApply(page);

    const after = await getScrollY(page);
    expect(Math.abs(after - before)).toBeLessThanOrEqual(SCROLL_TOLERANCE);
    await expect(page).toHaveURL(/county=Cook/i);
  });

  test("page introduction underline does not replay after filter apply", async ({ page }) => {
    await page.goto("/recruitment");
    await page.waitForFunction(() => {
      const svgPath = document.querySelector(".hand-drawn-underline-path") as SVGPathElement | null;
      if (!svgPath) return true;
      return (
        svgPath.classList.contains("hand-drawn-underline-path--drawn") &&
        Number.parseFloat(window.getComputedStyle(svgPath).strokeDashoffset) <= 0.05
      );
    });

    const before = await underlineOffset(page);
    await scrollToFilterPanel(page, "recruitment-county-table-heading");
    await page.getByLabel("Search county").fill("Cook");
    await clickWithoutScroll(page.getByRole("button", { name: "Apply filters" }));
    await waitForFilterApply(page);

    const after = await underlineOffset(page);
    expect(after).toBeLessThanOrEqual(0.05);
    expect(after).toBeCloseTo(before, 1);
  });

  test("filter apply resets retention pagination to page 1", async ({ page }) => {
    await page.goto("/retention?priority=High&page=2&pageSize=10");
    await page.getByLabel("Outreach priority").click();
    await page.getByRole("option", { name: "Medium" }).click();
    await clickWithoutScroll(page.getByRole("button", { name: "Apply filters" }));
    await waitForFilterApply(page);

    await expect(page).toHaveURL(/priority=Medium/);
    await expect(page).not.toHaveURL(/page=2/);
  });
});
