import { test, expect } from "@playwright/test";

test.describe("provider detail page", () => {
  test("renders provider metrics, outreach reasons, and activity timeline", async ({ page }) => {
    await page.goto("/providers/500001");

    await expect(page.getByRole("heading", { level: 1, name: "Provider 500001" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Adams County", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "License and placement status" })).toBeVisible();
    await expect(page.getByText("Current preference", { exact: true })).toBeVisible();
    await expect(page.getByText(/Current preference: Ages/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent placement activity" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Why this provider appears in the outreach list" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Merged activity-period timeline" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "What staff may want to review" }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Foster-home placement activity periods"),
    ).toBeVisible();
  });

  test("shows every triggered outreach reason for a high-priority provider", async ({ page }) => {
    await page.goto("/providers/500021");

    await expect(page.getByText(/No current placement and license ends in/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /High suggested outreach priority/i })).toBeVisible();
  });

  test("links back to the provider county recruitment page", async ({ page }) => {
    await page.goto("/providers/500001");

    await expect(
      page.getByRole("link", { name: "View Adams County recruitment context" }),
    ).toHaveAttribute("href", "/recruitment/Adams");
  });

  test("returns not found for an invalid provider id", async ({ page }) => {
    await page.goto("/providers/not-a-provider");

    await expect(page.getByRole("heading", { name: "Provider not found" })).toBeVisible();
  });
});
