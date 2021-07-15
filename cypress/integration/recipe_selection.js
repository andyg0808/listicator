import {
  ingredients,
  markDefaultRecipe,
  defaultRecipe,
  setCountOfDefaultRecipe,
} from "../support/default_recipe";
import { databaseNumberToDisplayNumber } from "../../src/types";
describe("Check a recipe", () => {
  const list = '[data-test^="StoreList"]';

  it("should add items to the lists when a recipe is checked", () => {
    cy.visit("http://localhost:3000/");
    markDefaultRecipe();
    cy.contains(list, "Undecided").as("list");
    ingredients.forEach((desc) => {
      cy.get("@list").contains(desc);
    });
  });

  it("should support setting the number of items on a recipe", () => {
    cy.visit("http://localhost:3000/");
    markDefaultRecipe();
    setCountOfDefaultRecipe(3);
    cy.contains(list, "Undecided").as("list");
    defaultRecipe.ingredients.forEach((order) => {
      const amount = databaseNumberToDisplayNumber(order.amount.quantity);
      if (amount === null) {
        return;
      }
      cy.get("@list")
        .contains("li", order.ingredient.name)
        .contains(amount.mul(3).toFraction());
    });
  });
});
