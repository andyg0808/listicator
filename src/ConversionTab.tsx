/** @jsxImportSource @emotion/react */
import * as React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { Recipe, Order, getDescription, totalOrderFromOrder } from "./types";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

export function ConversionTab() {
  const recipes = useSelector((state: RootState) => state.recipes.present);
  const [recipeId, setRecipe] = React.useState(recipes[0].title);
  const recipe = recipes.find((r) => r.title === recipeId);

  return (
    <div css={{ maxWidth: "500px", margin: "auto", paddingTop: "30px" }}>
      <FormControl css={{ width: "100%" }}>
        <InputLabel>Recipe</InputLabel>
        <Select
          value={recipe?.title}
          onChange={(e) => setRecipe(e.target.value as string)}
        >
          {recipes.map((recipe: Recipe, index: number) => (
            <MenuItem value={recipe.title}>{recipe.title}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {recipe && (
        <div>
          <h2>{recipe.title}</h2>
          <div>
            {recipe.ingredients.map((order: Order) => (
              <div>{getDescription(totalOrderFromOrder(order))}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
