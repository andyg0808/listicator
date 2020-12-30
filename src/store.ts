import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import * as R from "ramda";

import {
  Recipe,
  Ingredient,
  Menu,
  MenuList,
  Order,
  ShoppingList,
  Store,
  TotalOrder,
  ShoppingOrderMap,
} from "./types";

import { moveItemsDown } from "./sequence";
import { reducer as shoppingOrderReducer } from "./shopping_order";
import { reducer as storePreferenceReducer } from "./store_preference";
import { reducer as menuSelectionsReducer } from "./menu_selections";

const initialRecipes: Recipe[] = [];

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

const rootReducer = combineReducers({
  recipes: recipeSlice.reducer,
  shoppingOrder: shoppingOrderReducer,
  storePreference: storePreferenceReducer,
  menuSelections: menuSelectionsReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
