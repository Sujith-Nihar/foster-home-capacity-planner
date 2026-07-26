import { test, expect } from "@playwright/test";

test.describe("recruitment pagination", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recruitment", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /County recruitment review/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("shows at most 10 counties on the first page by default", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
    await expect(rows).toHaveCount(10, { timeout: 15_000 });
    await expect(page.getByText(/Showing 1–10 of/i)).toBeVisible();
  });

  test("navigates to the next page and updates the visible range", async ({ page }) => {
    const nextButton = page.getByRole("button", { name: "Next" });
    await expect(nextButton).toBeEnabled({ timeout: 15_000 });
    await nextButton.click();

    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText(/Showing 11–20 of/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("table tbody tr")).toHaveCount(10);
  });

  test("resets to page 1 when filters are applied", async ({ page }) => {
    const nextButton = page.getByRole("button", { name: "Next" });
    await expect(nextButton).toBeEnabled({ timeout: 15_000 });
    await nextButton.click();
    await expect(page).toHaveURL(/page=2/);

    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).not.toHaveURL(/page=2/);
    await expect(page.getByText(/Showing 1–10 of/i)).toBeVisible({ timeout: 15_000 });
  });

  test("changes page size and resets to page 1", async ({ page }) => {
    const nextButton = page.getByRole("button", { name: "Next" });
    await expect(nextButton).toBeEnabled({ timeout: 15_000 });
    await nextButton.click();
    await expect(page).toHaveURL(/page=2/);

    await page.getByLabel("Rows per page").click();
    await page.getByRole("option", { name: "50" }).click();

    await expect(page).toHaveURL(/pageSize=50/);
    await expect(page).not.toHaveURL(/page=2/);
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15_000 });
  });
});
