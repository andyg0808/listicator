import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Recipe, DisplayNumber, DatabaseNumber } from "./types";
import * as R from "ramda";
import { recipe } from "./init_recipes";

type RecipeStore = Recipe[];
const recipeSlice = createSlice({
  name: "recipes",
  initialState: [recipe] as RecipeStore,
  reducers: {
    addRecipe(state: RecipeStore, action: PayloadAction<Recipe>) {
      state.push(action.payload);
    },
    setRecipe(state: RecipeStore, action: PayloadAction<Recipe>): RecipeStore {
      const recipe = action.payload;
      const idx = R.findIndex((r) => r.title === recipe.title, state);
      if (idx === -1) {
        return R.append(recipe, state);
      }
      const idxLens = R.lensIndex(idx);
      return R.set(idxLens, recipe, state);
    },
    deleteRecipe(
      state: RecipeStore,
      action: PayloadAction<Recipe>
    ): RecipeStore {
      const recipe = action.payload;
      const idx = R.findIndex((r) => r.title === recipe.title, state);
      if (idx === -1) {
        return state;
      }
      return R.remove(idx, 1, state);
    },
  },
});

// function toDatabase(list: Recipe<DisplayNumber>[]): Recipe<DatabaseNumber>[] {
//     function recipeTransform(recipe: Recipe<DisplayNumber>): Recipe<DatabaseNumber> {
//         return R.over(R.lensProp('ingredients'), ingredientsTransform, recipe)
//     }
//     function ingredientsTransform(ingredients: Array<Order<DisplayNumber>>): Array<Order<DatabaseNumber>> {
//         return ingredients.map(ingredientTransform)
//     }
//     function ingredientTransform(
//     return list.map(recipeTransform)
// }

export const { addRecipe, setRecipe, deleteRecipe } = recipeSlice.actions;
export const reducer = recipeSlice.reducer;
