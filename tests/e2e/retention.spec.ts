import { test, expect } from "@playwright/test";

test.describe("retention page", () => {
  test("renders KPI cards, decision-support callout, and provider table", async ({ page }) => {
    await page.goto("/retention");

    await expect(page.getByRole("heading", { name: "Retention", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Licensed provider snapshot" })).toBeVisible();
    await expect(page.getByText("Currently licensed providers", { exact: true })).toBeVisible();
    await expect(page.getByText("High outreach-priority providers", { exact: true })).toBeVisible();
    await expect(
      page.getByText(/Outreach priority is rule-based decision support/i),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Licensed provider outreach list" }),
    ).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /Outreach priority/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /Reasons/i })).toBeVisible();
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
