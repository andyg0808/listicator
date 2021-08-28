import { test, expect } from "@playwright/test";
import { BuildTab } from "./BuildTab";
import fc from "fast-check";

test.describe("Stores", () => {
  test.beforeEach(({ page }) => {
    const tab = new BuildTab(page);
    tab.goto();
  });

  const list = (name) => `[data-test="StoreList-${name}"]`;

  test("should allow the user to add new stores", async ({ page }) => {
    const tab = new BuildTab(page);
    const storeNames = fc.sample(
      fc.string({ minLength: 1 }).filter((s) => !/["]/.test(s) && s !== ""),
      10
    );
    await tab.addStores(storeNames);
    const anyList = page.locator('[data-test^="StoreList"]');

    for (const store of storeNames) {
      await expect(
        anyList.locator(`text=${JSON.stringify(store)}`)
      ).toBeVisible();
    }
  });

  // xit("should allow the user to drag and drop", () => {
  //   cy.contains("Pizza Sauce").click();
  //   const name = randomName();
  //   cy.get(list("Undecided"))
  //     .contains(name)
  //     .drag(list("Food Store"), { position: "center" });
  // });
});
