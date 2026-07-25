import { test, expect } from "@playwright/test";

async function measureNavigation(page: import("@playwright/test").Page, click: () => Promise<void>) {
  const startedAt = Date.now();
  await click();
  await page.waitForFunction(() => Boolean(document.querySelector('[aria-label="Loading county detail"], [aria-label="Loading provider detail"], h1')));
  const shellVisibleMs = Date.now() - startedAt;
  await page.waitForLoadState("networkidle");
  const settledMs = Date.now() - startedAt;
  return { shellVisibleMs, settledMs };
}

test.describe("detail route navigation performance", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("recruitment to county uses client-side navigation with loading shell", async ({ page }) => {
    await page.goto("/recruitment");
    await page.waitForLoadState("networkidle");

    const viewCounty = page.getByRole("link", { name: /View county/i }).first();
    const href = await viewCounty.getAttribute("href");
    expect(href).toMatch(/^\/recruitment\//);

    const { shellVisibleMs, settledMs } = await measureNavigation(page, () => viewCounty.click());
    expect(shellVisibleMs).toBeLessThan(2500);
    expect(settledMs).toBeLessThan(8000);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(page.url()).toContain(href!);
  });

  test("retention to provider uses client-side navigation with loading shell", async ({ page }) => {
    await page.goto("/retention?priority=High&pageSize=10");
    await page.waitForLoadState("networkidle");

    const viewProvider = page.getByRole("link", { name: "View provider" }).first();
    const href = await viewProvider.getAttribute("href");
    expect(href).toMatch(/^\/providers\/\d+$/);

    const { shellVisibleMs, settledMs } = await measureNavigation(page, () => viewProvider.click());
    expect(shellVisibleMs).toBeLessThan(2500);
    expect(settledMs).toBeLessThan(8000);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(page.url()).toContain(href!);
  });

  test("pagination then provider navigation remains client-side", async ({ page }) => {
    await page.goto("/retention?priority=High&pageSize=10&page=2");
    await page.waitForLoadState("networkidle");

    const viewProvider = page.getByRole("link", { name: "View provider" }).first();
    await viewProvider.click();
    await expect(page).toHaveURL(/\/providers\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
