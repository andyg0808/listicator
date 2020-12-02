import { configureStore, createAction } from "@reduxjs/toolkit";
import { Ingredient, Store, ShoppingOrder, ShoppingList, Order } from "./types";

export interface RootState {
  lists: Array<ShoppingList>;
}

const trader_joes: Store = {
  name: "Trader Joe's",
  item_order: [],
};

function rootReducer(state: RootState = { lists: [] }, action) {
  return state;
}

// export type RootState = ReturnType<typeof rootReducer>;

const items: Array<Order> = [
  { ingredient: { name: "Sourdough bread" }, quantity: 2, unit: "C" },
  { ingredient: { name: "Spaghetti" }, quantity: 1, unit: "lb" },
];
const list: ShoppingList = {
  items: items,
  store: trader_joes,
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: { lists: [list] },
});

export default store;
