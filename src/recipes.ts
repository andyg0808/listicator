import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Recipe } from "./types";
import * as R from "ramda";

const recipeSlice = createSlice({
  name: "recipes",
  initialState: [] as Recipe[],
  reducers: {
    addRecipe(state, action: PayloadAction<Recipe>) {
      state.push(action.payload);
    },
    setRecipe(state, action: PayloadAction<Recipe>) {
      const recipe = action.payload;
      const idx = R.findIndex((r) => r.title === recipe.title, state);
      if (idx === -1) {
        return R.append(recipe, state);
      }
      const idxLens = R.lensIndex(idx);
      return R.set(idxLens, recipe, state);
    },
  },
});

export const { addRecipe, setRecipe } = recipeSlice.actions;
export const reducer = recipeSlice.reducer;
