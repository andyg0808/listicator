import { Locator, Page } from "@playwright/test";
import { AddRecipe } from "./AddRecipe";
import { ShopTab } from "./ShopTab";

export class BuildTab {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async checkDefaultRecipe(): Promise<void> {
    await this.page.click("text=Pizza Sauce");
  }

  async goto(): Promise<void> {
    await this.page.goto("http://localhost:3000");
  }

  async setCountOfDefaultRecipe(count: number): Promise<void> {
    const line = this.page.locator(
      'li:has(:text("Pizza Sauce")) input[type="number"]'
    );
    await line.selectText();
    await line.type(String(count));
  }

  async addRecipe(): Promise<AddRecipe> {
    const addRecipe = '[title="Add Recipe"]';
    await this.page.click(addRecipe);
    return new AddRecipe(this.page);
  }

  async ensureRecipe(title: string, text: string) {
    const addRecipe = await this.addRecipe();
    await addRecipe.typeTitle(title);
    await addRecipe.typeText(text);
    await addRecipe.save();
  }

  recipeExists(title: string): Locator {
    return this.page.locator(`li:has(:text("${title}"))`);
  }

  async editRecipe(title: string): Promise<AddRecipe> {
    const editButton = this.recipeExists(title).locator('[data-test="Edit"]');
    await editButton.click();
    return new AddRecipe(this.page);
  }

  async addStore(store: string): Promise<void> {
    await this.addStores([store]);
  }

  async addStores(stores: Array<string>): Promise<void> {
    const configureStore = '[data-test^="Configure Stores"]';
    const newStore = '[data-test="New Store"] input';
    const addStore = '[data-test="Add store"]';
    await this.page.click(configureStore);
    for (const store of stores) {
      await this.page.type(newStore, store);
      await this.page.click(addStore);
    }
    await this.page.click(".MuiBackdrop-root");
  }

  async gotoShopTab(): Promise<ShopTab> {
    await this.page.click("text=Shop");
    return new ShopTab(this.page);
  }
}
