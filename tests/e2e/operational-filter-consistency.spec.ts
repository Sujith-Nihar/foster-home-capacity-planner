import { test, expect, type Locator, type Page } from "@playwright/test";

const VIEWPORTS = [1600, 1440, 1280, 1024, 768, 390] as const;
const TOLERANCE = 3;

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

function operationalSurface(page: Page, headingId: string) {
  return page.locator(`#${headingId}`).locator("xpath=ancestor::section[1]");
}

async function gapBetween(top: Locator, bottom: Locator) {
  const topBox = await top.boundingBox();
  const bottomBox = await bottom.boundingBox();
  expect(topBox).not.toBeNull();
  expect(bottomBox).not.toBeNull();
  return bottomBox!.y - (topBox!.y + topBox!.height);
}

test.describe("operational filter and table consistency", () => {
  for (const width of VIEWPORTS) {
    test(`recruitment and retention share layout metrics at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      await page.goto("/recruitment");
      const recruitmentSurface = operationalSurface(page, "recruitment-county-table-heading");
      await expect(recruitmentSurface).toBeVisible();

      const recruitmentPanel = recruitmentSurface.locator(".operational-filter-panel").first();
      const recruitmentTitle = recruitmentPanel.locator(".operational-filter-panel__title");
      const recruitmentDescription = recruitmentPanel.locator(".operational-filter-panel__description");
      const recruitmentControl = recruitmentPanel.locator(".operational-filter-control").first();
      const recruitmentApply = recruitmentPanel.getByRole("button", { name: "Apply filters" });
      const recruitmentMore = recruitmentPanel.getByRole("button", { name: /More filters/i });
      const recruitmentResult = recruitmentPanel.locator(".operational-filter-result-count");
      const recruitmentHeaderCell = recruitmentSurface.locator(".operational-table-head-cell").first();

      await expect(recruitmentControl).toBeVisible();
      await expect(recruitmentApply).toBeVisible();
      await expect(recruitmentMore).toBeVisible();
      await expect(recruitmentResult).toBeVisible();

      const recruitmentControlBox = await recruitmentControl.boundingBox();
      const recruitmentApplyBox = await recruitmentApply.boundingBox();
      const recruitmentPanelBox = await recruitmentPanel.boundingBox();

      expect(recruitmentControlBox).not.toBeNull();
      expect(recruitmentApplyBox).not.toBeNull();
      expect(recruitmentPanelBox).not.toBeNull();
      expect(recruitmentControlBox!.height).toBeGreaterThanOrEqual(48 - TOLERANCE);
      expect(recruitmentControlBox!.height).toBeLessThanOrEqual(48 + TOLERANCE);
      expect(recruitmentApplyBox!.height).toBeGreaterThanOrEqual(44 - TOLERANCE);
      expect(recruitmentApplyBox!.height).toBeLessThanOrEqual(44 + TOLERANCE);

      const recruitmentTitleGap = await gapBetween(recruitmentTitle, recruitmentDescription);
      expect(recruitmentTitleGap).toBeGreaterThanOrEqual(8 - TOLERANCE);
      expect(recruitmentTitleGap).toBeLessThanOrEqual(8 + TOLERANCE);

      const recruitmentControls = recruitmentPanel.locator(".operational-filter-panel__controls");
      const recruitmentDescriptionGap = await gapBetween(recruitmentDescription, recruitmentControls);
      expect(recruitmentDescriptionGap).toBeGreaterThanOrEqual(28 - TOLERANCE);
      expect(recruitmentDescriptionGap).toBeLessThanOrEqual(28 + TOLERANCE);

      let recruitmentHeaderHeight: number | null = null;
      if (width >= 769) {
        const recruitmentHeaderBox = await recruitmentHeaderCell.boundingBox();
        expect(recruitmentHeaderBox).not.toBeNull();
        expect(recruitmentHeaderBox!.height).toBeGreaterThanOrEqual(68 - TOLERANCE);
        recruitmentHeaderHeight = recruitmentHeaderBox!.height;
      }

      await expectNoDocumentHorizontalOverflow(page);

      await page.goto("/retention");
      const retentionSurface = operationalSurface(page, "retention-provider-table-heading");
      await expect(retentionSurface).toBeVisible();

      const retentionPanel = retentionSurface.locator(".operational-filter-panel").first();
      const retentionTitle = retentionPanel.locator(".operational-filter-panel__title");
      const retentionDescription = retentionPanel.locator(".operational-filter-panel__description");
      const retentionControl = retentionPanel.locator(".operational-filter-control").first();
      const retentionApply = retentionPanel.getByRole("button", { name: "Apply filters" });
      const retentionMore = retentionPanel.getByRole("button", { name: /More filters/i });
      const retentionResult = retentionPanel.locator(".operational-filter-result-count");
      const retentionHeaderCell = retentionSurface.locator(".operational-table-head-cell").first();

      const retentionControlBox = await retentionControl.boundingBox();
      const retentionApplyBox = await retentionApply.boundingBox();
      const retentionPanelBox = await retentionPanel.boundingBox();

      expect(retentionControlBox).not.toBeNull();
      expect(retentionApplyBox).not.toBeNull();
      expect(retentionPanelBox).not.toBeNull();

      expect(retentionControlBox!.height).toBeCloseTo(recruitmentControlBox!.height, 0);
      expect(retentionApplyBox!.height).toBeCloseTo(recruitmentApplyBox!.height, 0);
      expect(retentionPanelBox!.width).toBeCloseTo(recruitmentPanelBox!.width, 0);

      const retentionTitleGap = await gapBetween(retentionTitle, retentionDescription);
      expect(retentionTitleGap).toBeCloseTo(recruitmentTitleGap, 0);

      const retentionControls = retentionPanel.locator(".operational-filter-panel__controls");
      const retentionDescriptionGap = await gapBetween(retentionDescription, retentionControls);
      expect(retentionDescriptionGap).toBeCloseTo(recruitmentDescriptionGap, 0);

      await expect(retentionMore).toHaveAttribute("aria-expanded", /true|false/);
      await expect(retentionMore).toHaveAttribute("aria-controls", "retention-advanced-filters");

      const retentionApplyY = retentionApplyBox!.y;
      const retentionClearY = (await retentionPanel.getByRole("button", { name: "Clear filters" }).boundingBox())!.y;
      const retentionExportY = (await retentionPanel.getByRole("link", { name: "Export CSV" }).boundingBox())!.y;
      if (width >= 1024) {
        expect(Math.abs(retentionApplyY - retentionClearY)).toBeLessThanOrEqual(TOLERANCE);
        expect(Math.abs(retentionApplyY - retentionExportY)).toBeLessThanOrEqual(TOLERANCE);
      } else {
        await expect(retentionPanel.getByRole("button", { name: "Clear filters" })).toBeVisible();
        await expect(retentionPanel.getByRole("link", { name: "Export CSV" })).toBeVisible();
      }

      const retentionResultBox = await retentionResult.boundingBox();
      const retentionActionsBox = await retentionPanel.locator(".operational-filter-actions").boundingBox();
      expect(retentionResultBox).not.toBeNull();
      expect(retentionActionsBox).not.toBeNull();
      expect(retentionResultBox!.y - (retentionActionsBox!.y + retentionActionsBox!.height)).toBeGreaterThanOrEqual(
        18 - TOLERANCE,
      );

      if (width >= 769 && recruitmentHeaderHeight !== null) {
        const retentionHeaderBox = await retentionHeaderCell.boundingBox();
        expect(retentionHeaderBox).not.toBeNull();
        expect(retentionHeaderBox!.height).toBeGreaterThanOrEqual(68 - TOLERANCE);
        expect(Math.abs(retentionHeaderBox!.height - recruitmentHeaderHeight)).toBeLessThanOrEqual(
          24 + TOLERANCE,
        );
      }

      await expectNoDocumentHorizontalOverflow(page);
    });
  }

  test("mobile stacks filter fields in one column", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ["/recruitment", "/retention"]) {
      await page.goto(route);
      const panel = page.locator(".operational-filter-panel").first();
      await panel.scrollIntoViewIfNeeded();
      const fields = panel.locator(".operational-filter-grid .operational-filter-field");
      const count = await fields.count();
      expect(count).toBeGreaterThanOrEqual(4);

      const firstField = fields.nth(0);
      const secondField = fields.nth(1);
      await expect(firstField).toBeVisible();
      await expect(secondField).toBeVisible();
      const firstBox = await firstField.boundingBox();
      const secondBox = await secondField.boundingBox();
      expect(firstBox).not.toBeNull();
      expect(secondBox).not.toBeNull();
      expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - TOLERANCE);
    }
  });
});
