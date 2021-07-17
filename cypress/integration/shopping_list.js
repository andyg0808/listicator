import { markDefaultRecipe, ingredients } from "../support/default_recipe";
import { addStore } from "../support/stores";
import {
  checkListItem,
  listItemShouldBeChecked,
  listItemShouldNotBeChecked,
} from "../support/lists";

describe("Shopping list", () => {
  const tab = '[role="tab"]';

  function clickShopTab() {
    cy.contains(tab, "Shop").click();
  }

  function clickBuildTab() {
    cy.contains(tab, "Build").click();
  }

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
    markDefaultRecipe();
    addStore("Basic");
    addStore("Second");
    clickShopTab();
  });

  it("should show all the undecided ingredients", () => {
    cy.contains("h2", "Undecided").next().as("undecided_list");
    ingredients.forEach((desc) => {
      cy.get("@undecided_list").contains(desc);
    });
  });

  it("should keep ingredient checkmarks when switching between tabs", () => {
    cy.contains("h2", "Undecided").next().as("undecided_list");
    const item = Cypress._.sample(ingredients);
    checkListItem(cy.get("@undecided_list").contains(item));
    listItemShouldBeChecked(cy.get("@undecided_list").contains(item));
    clickBuildTab();
    clickShopTab();
    cy.contains("h2", "Undecided").next().as("undecided_list");
    listItemShouldBeChecked(cy.get("@undecided_list").contains(item));
    ingredients.forEach((i) => {
      if (i !== item) {
        listItemShouldNotBeChecked(cy.get("@undecided_list").contains(i));
      }
    });
  });
});
