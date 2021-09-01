import * as React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { Recipe, Order } from "./types";

export function ConversionTab() {
  const recipes = useSelector((state: RootState) => state.recipes.present);
  const [recipe, setRecipe] = React.useState(recipes[0]);

  return (
    <div>
      <div>
        {recipes.map((recipe: Recipe) => (
          <p>{recipe.title}</p>
        ))}
      </div>
      <div>
        <h2>{recipe.title}</h2>
        <div>
          {recipe.ingredients.map((order: Order) => (
            <div>{order.ingredient.name}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
