import { Page, Locator } from "@playwright/test";
export class ListHelper {
  private page: Page;
  public readonly locator: Locator;
  constructor(page: Page, locator: Locator) {
    this.page = page;
    this.locator = locator;
  }
  findListItem(item: string): Locator {
    return this.locator.locator(`li:has(:text("${item}"))`);
  }

  findListCheckbox(item: string): Locator {
    return this.findListItem(item).locator('input[type="checkbox"]');
  }
}
