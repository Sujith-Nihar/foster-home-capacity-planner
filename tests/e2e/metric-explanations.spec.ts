import { test, expect } from "@playwright/test";

const PROHIBITED_PRIMARY_PHRASES = [
  /75th percentile/i,
  /statewide median/i,
  /Engagement below 10%/i,
  /quality score/i,
  /predict(?:ion|s)? of closure/i,
];

test.describe("metric explanations", () => {
  test("methodology identifies prototype-created thresholds", async ({ page }) => {
    await page.goto("/methodology");

    await expect(page.getByRole("heading", { name: /Planning rules selected for this prototype/i })).toBeVisible();
    await expect(
      page.getByText(/were not supplied by DCFS/i),
    ).toBeVisible();
    await expect(page.getByText(/75th percentile marks the top quarter/i).first()).toBeVisible();
  });

  test("recruitment page links to calculation explanation", async ({ page }) => {
    await page.goto("/recruitment");
    await expect(page.getByText("How recruitment attention is calculated")).toBeVisible();
    await page.getByText("How recruitment attention is calculated").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByText(/at least 10 current foster-home children and 3 engaged providers/i).first(),
    ).toBeVisible();
  });

  test("retention page links to calculation explanation", async ({ page }) => {
    await page.goto("/retention");
    await expect(page.getByText("How suggested outreach priority is calculated")).toBeVisible();
    await expect(page.getByText(/does not predict closure/i)).toBeVisible();
  });

  test("county page explains the comparison group", async ({ page }) => {
    await page.goto("/recruitment/Cook");
    await expect(page.getByRole("heading", { name: "Why this county warrants review" })).toBeVisible();
    await expect(
      page.getByText(/Compared with counties that have at least 10 current foster-home children and 3 engaged providers/i),
    ).toBeVisible();
  });

  test("provider page includes the non-prediction caveat", async ({ page }) => {
    await page.goto("/providers/500021");
    await expect(
      page.getByRole("heading", { name: "Why this provider appears in the outreach list" }),
    ).toBeVisible();
    await expect(page.getByText(/does not predict provider closure/i)).toBeVisible();
  });

  test("overview includes planning priority callout", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "How priorities are created" })).toBeVisible();
    await expect(page.getByText(/transparent prototype rules that organize staff review/i)).toBeVisible();
  });

  for (const route of ["/recruitment", "/retention", "/recruitment/Cook", "/providers/500021"]) {
    test(`primary content on ${route} avoids unexplained technical phrasing`, async ({ page }) => {
      await page.goto(route);
      const mainText = await page.getByRole("main").innerText();

      for (const phrase of PROHIBITED_PRIMARY_PHRASES) {
        expect(mainText).not.toMatch(phrase);
      }
    });
  }
});
