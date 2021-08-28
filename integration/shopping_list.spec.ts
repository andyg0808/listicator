import { test, expect } from "@playwright/test";
import { BuildTab } from "./BuildTab";
import { ShopTab } from "./ShopTab";
import { ingredients } from "./default_recipe";
import sample from "lodash/sample";
// import { markDefaultRecipe, ingredients } from "../support/default_recipe";
// import { addStore } from "../support/stores";
// import { clickShopTab, clickBuildTab } from "../support/navigation";
// import {
//   checkListItem,
//   listItemShouldBeChecked,
//   listItemShouldNotBeChecked,
// } from "../support/lists";

test.describe("Shopping list", () => {
  test.beforeEach(async ({ page }) => {
    const tab = new BuildTab(page);
    await tab.goto();
    await tab.checkDefaultRecipe();
    await tab.addStore("Basic");
    await tab.addStore("Second");
    await tab.gotoShopTab();
  });

  test("should show all the undecided ingredients", async ({ page }) => {
    const tab = new ShopTab(page);
    const undecided_list = tab.undecidedList();
    for (const ingredient of ingredients) {
      await expect(undecided_list.locator).toContainText(ingredient);
    }
  });

  test("should keep ingredient checkmarks when switching between tabs", async ({
    page,
  }) => {
    const tab = new ShopTab(page);
    const undecided_list = tab.undecidedList();
    const item = sample(ingredients);
    await undecided_list.findListCheckbox(item).check();

    await expect(undecided_list.findListCheckbox(item)).toBeChecked();
    const buildTab = await tab.gotoBuildTab();
    await buildTab.gotoShopTab();
    await expect(undecided_list.findListCheckbox(item)).toBeChecked();
    for (const ingredient of ingredients) {
      if (ingredient !== item) {
        await expect(
          undecided_list.findListCheckbox(ingredient)
        ).not.toBeChecked();
      }
    }
  });
});
