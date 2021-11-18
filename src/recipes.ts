import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";
import { Recipe, DisplayNumber, DatabaseNumber } from "./types";
import * as R from "ramda";
import { recipe } from "./init_recipes";

type RecipeStore = Recipe[];
type RecipeState = (Draft<Recipe> | Recipe)[];
type RecipeUpdate = {
  title: string;
  recipe: Recipe;
};
const recipeSlice = createSlice({
  name: "recipes",
  initialState: [recipe] as RecipeStore,
  reducers: {
    addRecipe(state: RecipeState, action: PayloadAction<Recipe>) {
      state.push(action.payload);
    },
    setRecipe(state: RecipeState, action: PayloadAction<Recipe>): RecipeState {
      const recipe = action.payload;
      const idx = R.findIndex((r) => r.title === recipe.title, state);
      if (idx === -1) {
        return R.append(recipe, state);
      }
      const idxLens = R.lensIndex<Draft<Recipe> | Recipe>(idx);
      return R.set(idxLens, recipe, state);
    },
    updateRecipe(
      state: RecipeState,
      action: PayloadAction<RecipeUpdate>
    ): RecipeState {
      const update = action.payload;
      const idx = R.findIndex((r) => r.title === update.title, state);
      if (idx === -1) {
        return R.append(update.recipe, state);
      }
      const idxLens = R.lensIndex<Draft<Recipe> | Recipe>(idx);
      return R.set(idxLens, update.recipe, state);
    },
    deleteRecipe(
      state: RecipeState,
      action: PayloadAction<Recipe>
    ): RecipeState {
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

export const { addRecipe, setRecipe, deleteRecipe, updateRecipe } =
  recipeSlice.actions;
export const reducer = recipeSlice.reducer;
