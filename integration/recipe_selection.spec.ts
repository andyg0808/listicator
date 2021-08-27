import { test, expect } from "@playwright/test";
import { ingredients, defaultRecipe } from "./default_recipe";
import { BuildTab } from "./build_tab";
import { databaseNumberMult } from "../src/types";

test.beforeEach(async ({ page }) => {
  const tab = new BuildTab(page);
  await tab.goto();
});

test("it should add items to the lists when a recipe is checked", async ({
  page,
}) => {
  const tab = new BuildTab(page);
  await tab.checkDefaultRecipe();
  for (const ingredient of ingredients) {
    await expect(page.locator(`text=${ingredient}`)).toBeVisible();
  }
});

test("it should support setting the number of items on a recipe", async ({
  page,
}) => {
  const tab = new BuildTab(page);
  await tab.checkDefaultRecipe();
  const qty = 2;
  await tab.setCountOfDefaultRecipe(qty);

  for (const order of defaultRecipe.ingredients) {
    const quantity = databaseNumberMult(order.amount.quantity, qty);
    if (quantity === null) {
      continue;
    }

    await expect(
      page.locator(`*css=span >> text=${order.ingredient.name}`)
    ).toContainText(String(quantity));
  }
});
