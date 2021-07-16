import { markDefaultRecipe, ingredients } from "../support/default_recipe";
import { addStore } from "../support/stores";

describe("Shopping list", () => {
  const tab = '[role="tab"]';

  function clickShopTab() {
    cy.contains(tab, "Shop").click();
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

  xit("should keep ingredient checkmarks when switching stores", () => {
    cy.contains("h2", "Undecided").next().as("undecided_list");
    ingredients.forEach((desc) => {
      cy.get("@undecided_list").contains(desc);
    });
  });
});
