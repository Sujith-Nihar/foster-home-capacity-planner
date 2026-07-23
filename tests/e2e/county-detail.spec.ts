import { test, expect } from "@playwright/test";

test.describe("county detail page", () => {
  test("renders Cook County recruitment context and retention links", async ({ page }) => {
    await page.goto("/recruitment/Cook");

    await expect(page.getByRole("heading", { name: "Cook County", exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole("banner", { name: "Application header" }).getByText("Reporting date:"),
    ).toBeVisible();
    await expect(page.getByText("High planning priority", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Current placement demand" })).toBeVisible();
    await expect(page.getByText("Current foster-home children", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Age-group pressure" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Retention outreach providers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Limitations and interpretation" })).toBeVisible();
    await expect(page.getByRole("link", { name: /View all county providers/i })).toHaveAttribute(
      "href",
      /\/retention\?county=Cook/,
    );
  });

  test("links to a provider detail page from the retention table", async ({ page }) => {
    await page.goto("/recruitment/Cook");

    const providerLink = page.getByRole("link", { name: /^Provider \d+$/ }).first();
    await expect(providerLink).toBeVisible();
    await providerLink.click();
    await expect(page).toHaveURL(/\/providers\/\d+$/);
  });

  test("returns not found for an invalid county route", async ({ page }) => {
    await page.goto("/recruitment/NotARealCountyXYZ");
    await expect(page.getByRole("heading", { name: "County not found" })).toBeVisible();
  });

  test("supports encoded county names with spaces", async ({ page }) => {
    await page.goto("/recruitment/St.%20Clair");

    await expect(page.getByRole("heading", { name: "St. Clair County", exact: true }).first()).toBeVisible();
  });
});
