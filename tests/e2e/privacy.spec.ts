import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/recruitment", "/retention", "/providers/500001", "/methodology"] as const;

test.describe("privacy guards", () => {
  for (const route of ROUTES) {
    test(`does not expose id_child in rendered HTML for ${route}`, async ({ page }) => {
      await page.goto(route);
      const html = await page.content();
      expect(html.toLowerCase()).not.toContain("id_child");
    });

    test(`does not expose id_child in network responses for ${route}`, async ({ page }) => {
      const responses: string[] = [];

      page.on("response", async (response) => {
        const contentType = response.headers()["content-type"] ?? "";
        if (!contentType.includes("json") && !contentType.includes("text")) {
          return;
        }
        try {
          responses.push((await response.text()).toLowerCase());
        } catch {
          // Ignore unreadable streaming responses.
        }
      });

      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(responses.join("\n")).not.toContain("id_child");
    });
  }
});
