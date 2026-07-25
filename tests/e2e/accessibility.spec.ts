import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const MAJOR_ROUTES = [
  "/",
  "/recruitment",
  "/recruitment/Cook",
  "/retention",
  "/providers/500001",
  "/methodology",
] as const;

async function waitForMotionToSettle(page: Page) {
  await page.getByRole("heading", { level: 1 }).first().waitFor();

  await page.waitForFunction(() =>
    [...document.querySelectorAll(".fi-text-reveal--enhanced")].every((element) =>
      element.classList.contains("fi-text-reveal--visible"),
    ),
  );

  const sectionReveals = page.locator(".fi-section-reveal--enhanced");
  const sectionCount = await sectionReveals.count();
  for (let index = 0; index < sectionCount; index += 1) {
    await sectionReveals.nth(index).scrollIntoViewIfNeeded();
  }

  if (sectionCount > 0) {
    await page.waitForFunction(() =>
      [...document.querySelectorAll(".fi-section-reveal--enhanced")].every((element) =>
        element.classList.contains("fi-section-reveal--visible"),
      ),
    );
  }

  const underline = page.locator(".hand-drawn-underline-path").first();
  if ((await underline.count()) > 0) {
    await page.waitForFunction(() => {
      const svgPath = document.querySelector(".hand-drawn-underline-path") as SVGPathElement | null;
      if (!svgPath) {
        return true;
      }
      if (!svgPath.classList.contains("hand-drawn-underline-path--drawn")) {
        return false;
      }
      const offset = Number.parseFloat(window.getComputedStyle(svgPath).strokeDashoffset);
      return offset <= 0.05;
    });
  }
}

test.describe("accessibility", () => {
  for (const route of MAJOR_ROUTES) {
    test(`passes axe checks on ${route}`, async ({ page }) => {
      await page.goto(route);
      await waitForMotionToSettle(page);
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
