import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const MAJOR_ROUTES = [
  "/",
  "/recruitment",
  "/recruitment/Cook",
  "/retention",
  "/providers/500001",
  "/methodology",
] as const;

test.describe("accessibility", () => {
  for (const route of MAJOR_ROUTES) {
    test(`passes axe checks on ${route}`, async ({ page }) => {
      await page.goto(route);

      await page.getByRole("heading", { level: 1 }).first().waitFor();

      if (route === "/") {
        const reveals = page.locator(".fi-section-reveal--enhanced");
        const count = await reveals.count();
        for (let index = 0; index < count; index += 1) {
          await reveals.nth(index).scrollIntoViewIfNeeded();
        }
        await page.waitForFunction(() =>
          [...document.querySelectorAll(".fi-section-reveal--enhanced")].every((element) =>
            element.classList.contains("fi-section-reveal--visible"),
          ),
        );
      }

      await page.evaluate(() => window.scrollTo(0, 0));
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("exposes visible chart summaries on the overview page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Total children in care:/i).first()).toBeVisible();
    await expect(page.getByText(/License expirations by month from/i).first()).toBeVisible();
  });
});
