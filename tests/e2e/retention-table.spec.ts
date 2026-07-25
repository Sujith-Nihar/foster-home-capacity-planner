import { test, expect, type Locator, type Page } from "@playwright/test";

const DESKTOP_VIEWPORTS = [1600, 1440, 1280, 1100, 1024] as const;
const MOBILE_VIEWPORTS = [768, 390] as const;

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function expectLocatorInsideContainer(locator: Locator, container: Locator) {
  const targetBox = await locator.boundingBox();
  const containerBox = await container.boundingBox();
  expect(targetBox).not.toBeNull();
  expect(containerBox).not.toBeNull();

  const targetRight = targetBox!.x + targetBox!.width;
  const containerRight = containerBox!.x + containerBox!.width;
  expect(targetBox!.x).toBeGreaterThanOrEqual(containerBox!.x - 1);
  expect(targetRight).toBeLessThanOrEqual(containerRight + 1);
  expect(targetBox!.width).toBeGreaterThan(0);
  expect(targetBox!.height).toBeGreaterThan(0);
}

function retentionTableViewport(page: Page) {
  return retentionTable(page).locator(".data-table-viewport");
}

function retentionTable(page: Page) {
  return page.locator("#retention-provider-table-heading").locator("xpath=ancestor::section[1]");
}

function retentionContentContainer(page: Page) {
  return page.locator(".app-container");
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
    await expect(table.getByRole("columnheader", { name: "Recent placement activity" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Suggested outreach" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Why review" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Action" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "County" })).toHaveCount(0);
    await expect(table.getByRole("columnheader", { name: "Status and license" })).toBeHidden();
  });

  test("shows county as secondary provider text", async ({ page }) => {
    const firstRow = retentionTable(page).locator(".table-desktop-only tbody tr").first();
    await expect(firstRow.locator("td").first()).toContainText(/County/i);
  });

  test("shows fully visible View provider actions with chevron icon", async ({ page }) => {
    const viewProvider = retentionTable(page)
      .locator(".table-desktop-only")
      .getByRole("link", { name: "View provider" })
      .first();
    await expect(viewProvider).toBeVisible();
    await expect(viewProvider).toContainText("View provider");
    await expect(viewProvider.locator("svg")).toBeVisible();
    await expectLocatorInsideContainer(viewProvider, retentionTableViewport(page));
    await expectLocatorInsideContainer(retentionTable(page), retentionContentContainer(page));
  });

  test("navigates to provider detail from View provider", async ({ page }) => {
    const viewProvider = retentionTable(page)
      .locator(".table-desktop-only")
      .getByRole("link", { name: "View provider" })
      .first();
    const href = await viewProvider.getAttribute("href");
    expect(href).toMatch(/^\/providers\/\d+$/);
    await viewProvider.click();
    await expect(page).toHaveURL(/\/providers\/\d+$/);
  });

  test("does not show technical engagement rule text in Why review", async ({ page }) => {
    const whyReview = retentionTable(page).locator(".table-desktop-only tbody tr").first().getByText(
      /Engagement below 10% with at least 90 eligible licensed days/,
    );
    await expect(whyReview).toHaveCount(0);
  });
});

for (const width of DESKTOP_VIEWPORTS) {
  test.describe(`retention layout at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("keeps View provider visible without page overflow", async ({ page }) => {
      await page.goto("/retention?priority=High&pageSize=10");
      const table = retentionTable(page);
      const viewProvider = table
        .locator(".table-desktop-only")
        .getByRole("link", { name: "View provider" })
        .first();
      await expect(viewProvider).toBeVisible();
      await expect(viewProvider).toContainText("View provider");
      await expect(viewProvider.locator("svg")).toBeVisible();
      await expectLocatorInsideContainer(viewProvider, retentionTableViewport(page));
      await expectLocatorInsideContainer(table, retentionContentContainer(page));
      await expectNoDocumentHorizontalOverflow(page);
    });
  });
}

test.describe("retention table at 1100px and below", () => {
  test.use({ viewport: { width: 1100, height: 900 } });

  test("merges status and license timing into one column", async ({ page }) => {
    await page.goto("/retention?priority=High&pageSize=10");
    const table = retentionTable(page);
    await expect(table.getByRole("columnheader", { name: "Status and license" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Current status" })).toBeHidden();
    await expect(table.getByRole("columnheader", { name: "License timing" })).toBeHidden();
  });
});

test.describe("retention table at 1024px", () => {
  test.use({ viewport: { width: 1024, height: 900 } });

  test("keeps six-column layout with visible action", async ({ page }) => {
    await page.goto("/retention?priority=High&pageSize=10");
    const table = retentionTable(page);
    await expect(table.getByRole("columnheader", { name: "Status and license" })).toBeVisible();
    const viewProvider = table
      .locator(".table-desktop-only")
      .getByRole("link", { name: "View provider" })
      .first();
    await expectLocatorInsideContainer(viewProvider, retentionTableViewport(page));
    await expectNoDocumentHorizontalOverflow(page);
  });
});

for (const width of MOBILE_VIEWPORTS) {
  test.describe(`retention mobile cards at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("renders provider cards with View provider action", async ({ page }) => {
      await page.goto("/retention?priority=High&pageSize=10");
      await expect(retentionTable(page).locator(".table-mobile-only").first()).toBeVisible();
      await expect(retentionTable(page).locator(".table-desktop-only")).toBeHidden();
      await expect(
        retentionTable(page).getByRole("link", { name: "View provider" }).first(),
      ).toBeVisible();
      await expectNoDocumentHorizontalOverflow(page);
    });
  });
}

test.describe("retention page line animation", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("draws underline once after paint and does not replay on filter change", async ({
    page,
  }) => {
    await page.goto("/retention?priority=High&pageSize=10");
    await page.waitForLoadState("networkidle");
    const path = page.locator(".hand-drawn-underline-path").first();
    await expect(path).toHaveCount(1);

    await page.waitForFunction(() => {
      const svgPath = document.querySelector(
        ".hand-drawn-underline-path",
      ) as SVGPathElement | null;
      if (!svgPath) {
        return false;
      }
      if (!svgPath.classList.contains("hand-drawn-underline-path--drawn")) {
        return false;
      }
      const offset = Number.parseFloat(window.getComputedStyle(svgPath).strokeDashoffset);
      return offset <= 0.05;
    });

    const dashoffsetAfterComplete = await path.evaluate((node) =>
      Number.parseFloat(window.getComputedStyle(node as SVGPathElement).strokeDashoffset),
    );
    expect(dashoffsetAfterComplete).toBeLessThanOrEqual(0.05);

    await page.getByRole("button", { name: /More filters/i }).click();
    await page.waitForTimeout(300);

    const dashoffsetAfterFilter = await path.evaluate((node) =>
      Number.parseFloat(window.getComputedStyle(node as SVGPathElement).strokeDashoffset),
    );
    expect(dashoffsetAfterFilter).toBeLessThanOrEqual(0.05);
  });

  test("renders completed underline immediately with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/retention?priority=High&pageSize=10");
    const path = page.locator(".hand-drawn-underline-path").first();
    await expect(path).toHaveCount(1);
    const offset = await path.evaluate((node) =>
      Number.parseFloat(window.getComputedStyle(node as SVGPathElement).strokeDashoffset),
    );
    expect(offset).toBeLessThanOrEqual(0.05);
  });
});

test.describe("retention page console health", () => {
  test("loads without console errors or failed chunks", async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("requestfailed", (request) => {
      const url = request.url();
      if (url.includes("_rsc=")) {
        return;
      }
      failedRequests.push(url);
    });

    await page.goto("/retention?priority=High&pageSize=10");
    await page.waitForLoadState("networkidle");

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
