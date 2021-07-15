import { recipe as defaultRecipe } from "../../src/init_recipes";
import { getDescription, databaseAmountToDisplayAmount } from "../../src/types";

export const ingredients = defaultRecipe.ingredients.map((order) => {
  const totalOrder = {
    ingredient: order.ingredient,
    amount: [databaseAmountToDisplayAmount(order.amount)],
  };
  return getDescription(totalOrder);
});

export { defaultRecipe };

export function randomIngredient() {
  return ingredients[Cypress._.random(ingredients.length - 1)];
}

export function setCountOfDefaultRecipe(count: number) {
  cy.contains("Pizza Sauce")
    .closest("li")
    .find('input[type="number"]')
    .clear()
    .type(`${count}{rightarrow}{backspace}`);
}

export function markDefaultRecipe() {
  cy.contains("Pizza Sauce")
    .closest("li")
    .find('input[type="checkbox"]')
    .check();
}
