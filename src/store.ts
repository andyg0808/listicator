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
  from: number;
  to: number;
}

const shoppingOrderSlice = createSlice({
  name: "shoppingOrder",
  initialState: {} as Record<string, ShoppingOrder>,
  reducers: {
    reorder(state, action: PayloadAction<ReorderEvent>) {
      const payload = action.payload;
      const order = state[payload.name];
      if (!order) {
        throw new Error("Move on unknown list");
      }
      const item = order.items[payload.from];
      order.items = order.items.reduce((acc, current, idx) => {
        if (idx === payload.from) {
          return;
        }
        if (idx === payload.to) {
          acc.push(item);
        }
        acc.push(current);
      });
      //order.items = move(payload.from, payload.to, order.items);
    },
  },
});

export const { reorder } = shoppingOrderSlice.actions;

export const { addRecipe } = recipeSlice.actions;

const rootReducer = combineReducers({
  recipes: recipeSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
