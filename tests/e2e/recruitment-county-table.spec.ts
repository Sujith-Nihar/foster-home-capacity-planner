import { test, expect, type Locator, type Page } from "@playwright/test";

const DESKTOP_VIEWPORTS = [1440, 1280, 1024] as const;

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

async function expectNoOverlap(locatorA: Locator, locatorB: Locator) {
  const boxA = await locatorA.boundingBox();
  const boxB = await locatorB.boundingBox();
  expect(boxA).not.toBeNull();
  expect(boxB).not.toBeNull();
  expect(boxesOverlap(boxA!, boxB!)).toBe(false);
}

async function expectTextFullyVisible(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);
}

function eligibleCountyTable(page: Page) {
  return page.locator("#recruitment-county-table-heading").locator("xpath=ancestor::section[1]");
}

test.describe("recruitment county comparison table", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recruitment");
  });

  test("shows six visible desktop columns at 1280px and above", async ({ page }) => {
    const table = eligibleCountyTable(page);
    await expect(table.getByRole("columnheader", { name: "County" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: /Suggested attention/i })).toBeVisible();
    await expect(table.getByRole("button", { name: /How suggested recruitment attention is calculated/i })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Provider base" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Placement pressure" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Age focus" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Near-term license exposure" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Pressure and age focus" })).toBeHidden();
    await expect(table.getByRole("columnheader", { name: "Action", exact: true })).toBeHidden();
  });

  test("opens suggested attention explanations from the column help and badge", async ({ page }) => {
    const table = eligibleCountyTable(page);
    const columnHelp = table.getByRole("button", {
      name: /How suggested recruitment attention is calculated/i,
    });
    await columnHelp.focus();
    await expect(columnHelp).toHaveAttribute("aria-expanded", "true");
    const columnPopover = page.locator(".recruitment-attention-popover").first();
    await expect(columnPopover).toContainText("Suggested recruitment attention");
    await expect(columnPopover).toContainText("View full methodology");
    await page.keyboard.press("Escape");

    const attentionBadge = table
      .locator(".table-desktop-only table tbody tr")
      .first()
      .getByRole("button", { name: /suggested attention/i })
      .first();
    await attentionBadge.focus();
    await expect(attentionBadge).toHaveAttribute("aria-expanded", "true");
    const badgePopover = page.locator(".recruitment-attention-badge-popover").first();
    await expect(badgePopover).toContainText(/recruitment attention/i);
    await expect(badgePopover).not.toContainText("top 25%");
  });

  test("navigates via View county", async ({ page }) => {
    const viewCounty = eligibleCountyTable(page).getByRole("link", { name: /View county/i }).first();
    await expect(viewCounty).toBeVisible();
    await viewCounty.click();
    await expect(page).toHaveURL(/\/recruitment\/[^/]+$/);
  });

  test("shows complete county names without clipping", async ({ page }) => {
    const countyLink = eligibleCountyTable(page)
      .locator(".table-desktop-only table tbody tr")
      .first()
      .getByRole("link")
      .first();
    await expect(countyLink).toBeVisible();
    await expectTextFullyVisible(countyLink);
    const text = await countyLink.innerText();
    expect(text).toMatch(/County$/);
    expect(text).not.toContain("…");
  });

  test("does not use icon-only county controls", async ({ page }) => {
    await expect(
      page.locator(".table-desktop-only").getByRole("button", { name: /Open .+ details/i }),
    ).toHaveCount(0);
  });
});

for (const width of DESKTOP_VIEWPORTS) {
  test.describe(`recruitment layout at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("keeps county names and View county visible without page overflow", async ({ page }) => {
      await page.goto("/recruitment");
      const table = eligibleCountyTable(page);
      const countyLink = table.locator(".table-desktop-only table tbody tr").first().getByRole("link").first();
      const viewCounty = table.getByRole("link", { name: /View county/i }).first();

      await expect(countyLink).toBeVisible();
      await expect(viewCounty).toBeVisible();
      await expectTextFullyVisible(countyLink);
      await expectTextFullyVisible(viewCounty);
      await expectNoDocumentHorizontalOverflow(page);
    });
  });
}

for (const width of [768, 390] as const) {
  test.describe(`recruitment mobile cards at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("renders county cards with View county action", async ({ page }) => {
      await page.goto("/recruitment");
      await expect(eligibleCountyTable(page).locator(".table-mobile-only").first()).toBeVisible();
      await expect(eligibleCountyTable(page).getByRole("link", { name: /View county/i }).first()).toBeVisible();
      await expectNoDocumentHorizontalOverflow(page);
    });
  });
}

test.describe("retention table actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/retention?priority=High&pageSize=10");
  });

  test("shows View provider actions that navigate to provider detail routes", async ({ page }) => {
    const viewProvider = page
      .locator(".table-desktop-only")
      .getByRole("link", { name: "View provider" })
      .first();
    await expect(viewProvider).toBeVisible();
    await viewProvider.click();
    await expect(page).toHaveURL(/\/providers\/\d+$/);
  });

  test("priority badge and reason do not overlap on high-priority rows", async ({ page }) => {
    const table = page.locator(".table-desktop-only table").first();
    const firstRow = table.locator("tbody tr").first();
    const badge = firstRow.getByText(/(High|Medium|Low) outreach/).first();
    const reason = firstRow
      .getByText(/Inactive|Limited activity|Currently active|No elevated/)
      .first();

    await expect(badge).toBeVisible();
    await expect(reason).toBeVisible();
    await expectNoOverlap(badge, reason);
  });

  test("shows fully visible View provider label at desktop widths", async ({ page }) => {
    const viewProvider = page
      .locator(".table-desktop-only")
      .getByRole("link", { name: "View provider" })
      .first();
    await expect(viewProvider).toBeVisible();
    await expectTextFullyVisible(viewProvider);
  });
});

test.describe("table console health", () => {
  test("recruitment and retention load without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/recruitment");
    await expect(eligibleCountyTable(page).getByRole("link", { name: /View county/i }).first()).toBeVisible();
    await page.goto("/retention");
    await expect(page.getByRole("link", { name: "View provider" }).first()).toBeVisible();

    expect(errors).toEqual([]);
  });
});
