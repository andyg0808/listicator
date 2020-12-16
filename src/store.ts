import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import {
  Recipe,
  Ingredient,
  Menu,
  MenuList,
  Order,
  ShoppingList,
  ShoppingOrder,
  Store,
  TotalOrder,
} from "./types";

const trader_joes: Store = {
  name: "Trader Joe's",
};

const items: Array<TotalOrder> = [
  {
    ingredient: { name: "Sourdough bread" },
    amount: [{ quantity: 2, unit: "C" }],
  },
  { ingredient: { name: "Spaghetti" }, amount: [{ quantity: 1, unit: "lb" }] },
];
const list: ShoppingList = {
  items: items,
  store: trader_joes,
};

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
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
