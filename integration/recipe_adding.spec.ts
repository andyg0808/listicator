import { test, expect } from "@playwright/test";
import { BuildTab } from "./BuildTab";

test.beforeEach(async ({ page }) => {
  const tab = new BuildTab(page);
  await tab.goto();
});

test.describe("Add a recipe", () => {
  const addRecipe = '[title="Add Recipe"]';

  test("should include the recipe title", async ({ page }) => {
    const tab = new BuildTab(page);

    const addRecipe = await tab.addRecipe();
    await addRecipe.typeTitle("Come on and ketch up!");
    await addRecipe.typeText("1/2 gallon ketchup");

    const ketchup = addRecipe.viewerLine("ketchup");
    await expect(ketchup.locator("text=1/2")).toBeVisible();
    await expect(ketchup.locator("text=gallon")).toBeVisible();

    await addRecipe.typeText("\n6 cubes ice");
    const ice = addRecipe.viewerLine("ice");
    await expect(ice.locator("text=6")).toBeVisible();
    await expect(ice.locator("text=cubes")).toBeVisible();

    await addRecipe.save();

    await expect(page.locator("text=Come on and ketch up")).toBeVisible();
  });

  test("should accept list forms", async ({ page }) => {
    const tab = new BuildTab(page);
    const addRecipe = await tab.addRecipe();
    await addRecipe.typeText("- 1/2 gallon ketchup");
    const ketchup = addRecipe.viewerLine("ketchup");
    await expect(ketchup.locator("text=1/2")).toBeVisible();
    await expect(ketchup.locator("text=gallon")).toBeVisible();
  });

  //test("should offer similar ingredients to switch to", () => {});
});
