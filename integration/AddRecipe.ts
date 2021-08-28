import { Page, Locator } from "@playwright/test";

export class AddRecipe {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async typeTitle(text: string) {
    const recipeTitle = '[data-test="Title"]';
    await this.page.type(recipeTitle, text);
  }

  async typeText(text: string) {
    const recipeText = '[data-test="Editor"]';
    await this.page.type(recipeText, text);
  }

  viewerLine(lineText: string): Locator {
    return this.page.locator(
      `[data-test="Viewer"] tr:has(:text("${lineText}"))`
    );
  }

  async save(): Promise<void> {
    await this.page.click("Save");
  }
}
