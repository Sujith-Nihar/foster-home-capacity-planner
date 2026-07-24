import { test, expect } from "@playwright/test";

test.describe("retention page", () => {
  test("renders KPI cards, decision-support callout, and provider table", async ({ page }) => {
    await page.goto("/retention");

    await expect(
      page.getByRole("heading", {
        name: /Support the foster homes already serving Illinois families/i,
      }),
    ).toBeVisible();
    await expect(page.getByText("Licensed providers", { exact: true })).toBeVisible();
    await expect(page.getByText("High outreach priority", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /licenses expire within 90 days/i })).toBeVisible();
    await expect(
      page.getByText(/Outreach priorities are based on recent activity, engagement and license timing/i),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Licensed provider outreach list" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Suggested outreach/i }),
    ).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /Why review/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Action" })).toBeVisible();
  });

  test("applies URL filters for county and outreach priority", async ({ page }) => {
    await page.goto("/retention?county=Cook&priority=High");

    await expect(page).toHaveURL(/county=Cook/);
    await expect(page).toHaveURL(/priority=High/);
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("links provider rows to provider detail pages", async ({ page }) => {
    await page.goto("/retention?priority=High&pageSize=5");

    const providerLink = page.getByRole("link", { name: /^\d+$/ }).first();
    await expect(providerLink).toBeVisible();
    await providerLink.click();
    await expect(page).toHaveURL(/\/providers\/\d+$/);
  });

  test("exposes a filtered CSV export action", async ({ page }) => {
    await page.goto("/retention?priority=High");

    const exportLink = page.locator('a[href^="/api/exports/retention"]');
    await expect(exportLink).toBeVisible();
    await expect(exportLink).toHaveAttribute("href", /priority=High/);
  });
});
