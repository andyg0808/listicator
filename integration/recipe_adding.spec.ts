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

  test("should offer similar ingredients to switch to", async ({ page }) => {
    const tab = new BuildTab(page);
    const addRecipe = await tab.addRecipe();
    await addRecipe.typeText("1 can organic tomato paste");
    const tomatoPaste = addRecipe.viewerLine("tomato paste");
    await tomatoPaste.click();
    await page.click('text="tomato paste"');
    await expect(page.locator(addRecipe.recipeText)).toContainText(
      "1 can tomato paste"
    );
    await expect(
      addRecipe.viewerLine("tomato paste").locator('text="tomato paste"')
    ).toBeVisible();
  });

  test("should require a title", async ({ page }) => {
    const tab = new BuildTab(page);
    const addRecipe = await tab.addRecipe();
    addRecipe.typeText("1 can organic tomato paste");
    await addRecipe.save();

    await expect(addRecipe.errorMessage()).toBeVisible();
  });

  test("should update an existing recipe when the title is changed", async ({
    page,
  }) => {
    const tab = new BuildTab(page);
    await tab.ensureRecipe("Coffee", "15 grams coffee");
    const editRecipe = await tab.editRecipe("Coffee");
    await editRecipe.typeTitle("Aeropress ");
    await editRecipe.save();
    await expect(tab.recipeExists("Aeropress Coffee")).toBeVisible();
  });
});
