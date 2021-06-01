import { recipe as defaultRecipe } from "../../src/init_recipes";
import { getDescription, databaseAmountToDisplayAmount } from "../../src/types";

describe("Check a recipe", () => {
  const list = '[data-test="StoreList"]';
  it("should add items to the lists when a recipe is checked", () => {
    cy.visit("http://localhost:3000/");
    cy.contains("Pizza Sauce").click();
    cy.contains(list, "Undecided").as("list");
    defaultRecipe.ingredients.forEach((order) => {
      const totalOrder = {
        ingredient: order.ingredient,
        amount: [databaseAmountToDisplayAmount(order.amount)],
      };
      const desc = getDescription(totalOrder);
      cy.get("@list").contains(desc);
    });
  });
});
