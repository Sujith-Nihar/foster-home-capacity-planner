import { test, expect } from "@playwright/test";

test.describe("county detail page", () => {
  test("renders Cook County recruitment context and retention links", async ({ page }) => {
    await page.goto("/recruitment/Cook");

    await expect(page.getByRole("heading", { name: "Cook County", exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole("banner", { name: "Application header" }).getByText("Reporting date:"),
    ).toBeVisible();
    await expect(page.getByText("High suggested recruitment attention", { exact: true })).toBeVisible();
    await expect(page.getByText("Eligible for comparison")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Key recruitment signals" })).toBeVisible();
    await expect(page.getByText("Current foster-home children", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Why this county warrants review" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Age-group recruitment focus" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Provider retention watch" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Priority-provider preview" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Limitations and appropriate use" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Review all Cook County providers/i }).first()).toHaveAttribute(
      "href",
      /\/retention\?county=Cook/,
    );
  });

  test("links to a provider detail page from the priority-provider preview", async ({ page }) => {
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

  test("toggles technical comparison details from a full-width table footer", async ({ page }) => {
    await page.goto("/recruitment/Cook");

    const toggle = page.getByRole("button", { name: "Show technical comparison details" });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Matching licensed providers")).toHaveCount(0);

    await toggle.click();
    const expandedToggle = page.getByRole("button", { name: "Hide technical comparison details" });
    await expect(expandedToggle).toHaveAttribute("aria-expanded", "true");
    await expect(expandedToggle).toBeVisible();
    await expect(page.getByText("Matching licensed providers")).toBeVisible();
    await expect(page.getByText("Exact typical comparable-county value")).toBeVisible();

    await expandedToggle.click();
    await expect(page.getByRole("button", { name: "Show technical comparison details" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(page.getByText("Matching licensed providers")).toHaveCount(0);
  });
});
