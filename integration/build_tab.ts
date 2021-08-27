import { Page } from "@playwright/test";

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

  async addRecipe(): Promise<void> {
    const addRecipe = '[title="Add Recipe"]';
    await this.page.click(addRecipe);
  }
}
