import { Page, Locator } from "@playwright/test";

export class AddRecipe {
  private page: Page;

  public readonly recipeText = '[data-test="Editor"] div.ProseMirror';

  constructor(page: Page) {
    this.page = page;
  }

  async typeTitle(text: string) {
    const recipeTitle = 'css=[data-test="Title"] input';
    await this.page.type(recipeTitle, text);
  }

  async typeText(text: string) {
    await this.page.type(this.recipeText, text);
  }

  errorMessage(): Locator {
    return this.page.locator("text=Error");
  }

  viewerLine(lineText: string): Locator {
    return this.page.locator(
      `[data-test="Viewer"] tr:has(:text("${lineText}"))`
    );
  }

  async save(): Promise<void> {
    await this.page.click("text=Save");
  }
}
