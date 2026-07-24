import { test, expect, type Locator, type Page } from "@playwright/test";

const DESKTOP_VIEWPORTS = [1440, 1280, 1024] as const;

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function expectTextFullyVisible(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);
}

function retentionTable(page: Page) {
  return page.locator("#retention-provider-table-heading").locator("xpath=ancestor::section[1]");
}

test.describe("retention provider table", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/retention?priority=High&pageSize=10");
  });

  test("shows seven desktop columns without a standalone county column", async ({ page }) => {
    const table = retentionTable(page);
    await expect(table.getByRole("columnheader", { name: "Provider" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Current status" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "License timing" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Recent engagement" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Suggested outreach" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Why review" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Action" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "County" })).toHaveCount(0);
    await expect(table.getByRole("columnheader", { name: "Status and renewal" })).toBeHidden();
  });

  test("shows county as secondary provider text", async ({ page }) => {
    const firstRow = retentionTable(page).locator(".table-desktop-only tbody tr").first();
    await expect(firstRow.locator("td").first()).toContainText(/County/i);
  });

  test("shows fully visible View provider actions", async ({ page }) => {
    const viewProvider = retentionTable(page)
      .locator(".table-desktop-only")
      .getByRole("link", { name: "View provider" })
      .first();
    await expect(viewProvider).toBeVisible();
    await expectTextFullyVisible(viewProvider);
    const text = await viewProvider.innerText();
    expect(text).toContain("View provider");
    expect(text).not.toContain("…");
  });
});

for (const width of DESKTOP_VIEWPORTS) {
  test.describe(`retention layout at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("keeps View provider visible without page overflow", async ({ page }) => {
      await page.goto("/retention?priority=High&pageSize=10");
      const viewProvider = retentionTable(page)
        .locator(".table-desktop-only")
        .getByRole("link", { name: "View provider" })
        .first();
      await expect(viewProvider).toBeVisible();
      await expectTextFullyVisible(viewProvider);
      await expectNoDocumentHorizontalOverflow(page);
    });
  });
}

test.describe("retention table at 1024px", () => {
  test.use({ viewport: { width: 1024, height: 900 } });

  test("merges status and license timing into one column", async ({ page }) => {
    await page.goto("/retention?priority=High&pageSize=10");
    const table = retentionTable(page);
    await expect(table.getByRole("columnheader", { name: "Status and renewal" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Current status" })).toBeHidden();
    await expect(table.getByRole("columnheader", { name: "License timing" })).toBeHidden();
  });
});

for (const width of [768, 390] as const) {
  test.describe(`retention mobile cards at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("renders provider cards with View provider action", async ({ page }) => {
      await page.goto("/retention?priority=High&pageSize=10");
      await expect(retentionTable(page).locator(".table-mobile-only").first()).toBeVisible();
      await expect(
        retentionTable(page).getByRole("link", { name: "View provider" }).first(),
      ).toBeVisible();
      await expectNoDocumentHorizontalOverflow(page);
    });
  });
}
