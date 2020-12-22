import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { move } from "ramda";

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
  ShoppingOrderMap,
} from "./types";

import { moveItemsDown } from "./sequence"

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

export interface ReorderEvent {
  name: string;
  store: string;
  from: number;
  to: number;
}

const shoppingOrderSlice = createSlice({
  name: "shoppingOrder",
  initialState: {} as Record<string, Record<string, number>>,
  reducers: {
    reorder(state, action: PayloadAction<ReorderEvent>) {
      const payload = action.payload;
      if (state[payload.store]) {
          state[payload.store][payload.name] = payload.to;
      } else {
        state[payload.store] = {[payload.name]: payload.to}
      }
      state[payload.store] = moveItemsDown(state[payload.store], payload.to)
    },
  },
});

export const { reorder } = shoppingOrderSlice.actions;

export const { addRecipe } = recipeSlice.actions;

const rootReducer = combineReducers({
  recipes: recipeSlice.reducer,
  shoppingOrder: shoppingOrderSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
