import { recipe as defaultRecipe } from "../../src/init_recipes";
import { getDescription, databaseAmountToDisplayAmount } from "../../src/types";

export const ingredients = defaultRecipe.ingredients.map((order) => {
  const totalOrder = {
    ingredient: order.ingredient,
    amount: [databaseAmountToDisplayAmount(order.amount)],
  };
  return getDescription(totalOrder);
});

export function randomIngredient() {
  return ingredients[Cypress._.random(ingredients.length - 1)];
}
