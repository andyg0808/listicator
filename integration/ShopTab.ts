import { Page } from "@playwright/test";
import { ListHelper } from "./ListHelper";
import { BuildTab } from "./BuildTab";
export class ShopTab {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  undecidedList(): ListHelper {
    return new ListHelper(
      this.page,
      this.page.locator('ul:below(h2:text("Undecided"))')
    );
  }

  async gotoBuildTab() {
    await this.page.click("text=Build");
    return new BuildTab(this.page);
  }
}
