import { test, expect } from "@playwright/test";

const EXPIRING_LICENSES_URL =
  /expiration=within_90.*sort=days_until_expiration.*direction=asc/;

async function clickViewExpiringLicenses(page: import("@playwright/test").Page) {
  const action = page
    .locator('[aria-labelledby="retention-attention-heading"]')
    .getByRole("link", {
      name: "View providers with licenses ending within 90 days",
    });
  await expect(action).toBeVisible();
  await action.click();
  await page.waitForURL(EXPIRING_LICENSES_URL, { timeout: 15_000 });
}

test.describe("view expiring licenses action", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("applies expiration filter, sort, scroll target, and focuses provider list", async ({
    page,
  }) => {
    await page.goto("/retention");

    await clickViewExpiringLicenses(page);

    const listHeading = page.getByRole("heading", { name: "Licensed provider outreach list" });
    await expect(listHeading).toBeVisible();
    await page.waitForFunction(() => {
      const heading = document.getElementById("retention-provider-table-heading");
      return heading === document.activeElement;
    });

    const listTop = await listHeading.boundingBox();
    const headerBottom = await page.locator(".app-header").boundingBox();
    expect(listTop).not.toBeNull();
    expect(headerBottom).not.toBeNull();
    if (listTop && headerBottom) {
      expect(listTop.y).toBeGreaterThanOrEqual(headerBottom.y + headerBottom.height - 4);
    }

    await expect(page.getByRole("button", { name: "Within 90 days Remove Within 90 days filter" })).toBeVisible();
  });

  test("sorts by soonest license expiration on the first page", async ({ page }) => {
    await page.goto(
      "/retention?expiration=within_90&sort=days_until_expiration&direction=asc&pageSize=10",
    );

    const expirationCells = page.locator(".table-desktop-only tbody tr td:nth-child(3)");
    const count = await expirationCells.count();
    if (count < 2) {
      test.skip();
    }

    const firstText = (await expirationCells.nth(0).innerText()).trim();
    const secondText = (await expirationCells.nth(1).innerText()).trim();
    const firstDays = Number.parseInt(firstText.match(/Ends in (\d+) days/)?.[1] ?? "", 10);
    const secondDays = Number.parseInt(secondText.match(/Ends in (\d+) days/)?.[1] ?? "", 10);

    expect(Number.isFinite(firstDays)).toBe(true);
    expect(Number.isFinite(secondDays)).toBe(true);
    expect(firstDays).toBeLessThanOrEqual(secondDays);
  });

  test("uses scroll-only behavior when the expiring-licenses view is already active", async ({
    page,
  }) => {
    await page.goto(
      "/retention?expiration=within_90&sort=days_until_expiration&direction=asc",
    );

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("button", { name: "View provider list" }).first().click();

    await expect(page).toHaveURL(
      "/retention?expiration=within_90&sort=days_until_expiration&direction=asc",
    );
    await page.waitForFunction(() => {
      const heading = document.getElementById("retention-provider-table-heading");
      return heading === document.activeElement;
    });
  });

  test("supports browser back to the previous retention view", async ({ page }) => {
    await page.goto("/retention?priority=High");
    await page.waitForLoadState("networkidle");
    await page.goto(
      "/retention?expiration=within_90&sort=days_until_expiration&direction=asc",
    );
    await page.goBack({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/priority=High/);
    await expect(page).not.toHaveURL(/expiration=within_90/);
  });

  test("preserves filtered state after refresh", async ({ page }) => {
    await page.goto(
      "/retention?expiration=within_90&sort=days_until_expiration&direction=asc",
    );
    await page.reload();

    await expect(page).toHaveURL(
      "/retention?expiration=within_90&sort=days_until_expiration&direction=asc",
    );
    await expect(page.getByRole("button", { name: "Within 90 days Remove Within 90 days filter" })).toBeVisible();
  });

  test("exports CSV with the active expiration filter", async ({ page }) => {
    await page.goto(
      "/retention?expiration=within_90&sort=days_until_expiration&direction=asc",
    );

    const exportLink = page.locator('a[href^="/api/exports/retention"]');
    await expect(exportLink).toHaveAttribute("href", /expiration=within_90/);
    await expect(exportLink).toHaveAttribute("href", /sort=days_until_expiration/);
  });

  test("scrolls immediately when reduced motion is enabled", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/retention");

    await clickViewExpiringLicenses(page);
    await expect(
      page.getByRole("heading", { name: "Licensed provider outreach list" }),
    ).toBeVisible();
  });

  test("works from keyboard activation", async ({ page }) => {
    await page.goto("/retention");
    const action = page
      .getByRole("link", { name: "View providers with licenses ending within 90 days" })
      .first();
    await action.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(EXPIRING_LICENSES_URL, { timeout: 10_000 });
    await page.waitForFunction(() => {
      const heading = document.getElementById("retention-provider-table-heading");
      return heading === document.activeElement;
    });
  });
});
