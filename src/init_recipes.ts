import { parse } from "./parser";
import { Recipe, DisplayNumber } from "./types";
export const text = `1 can tomato paste
1 tsp Italian seasoning
1 tsp oregano
2 shakes cayenne
2 shakes pepper flakes
1 tsp salt
1 tsp garlic
Water to thin`;

const ingredients = parse(text.trim());
if (!ingredients) {
  throw new Error("Invalid default recipe text");
}
export const recipe: Recipe = {
  title: "Pizza Sauce",
  ingredients,
};
