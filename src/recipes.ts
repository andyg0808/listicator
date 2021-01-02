import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Recipe } from "./types";

const recipeSlice = createSlice({
  name: "recipes",
  initialState: [] as Recipe[],
  reducers: {
    addRecipe(state, action: PayloadAction<Recipe>) {
      state.push(action.payload);
    },
  },
});

export const { addRecipe } = recipeSlice.actions;
export const reducer = recipeSlice.reducer;
