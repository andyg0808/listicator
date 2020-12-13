import { configureStore, createAction } from "@reduxjs/toolkit";
import {
  Ingredient,
  Menu,
  MenuList,
  Order,
  ShoppingList,
  ShoppingOrder,
  Store,
  TotalOrder,
} from "./types";

export interface RootState {
  menu_list: MenuList;
  menus: Menu[];
}

const trader_joes: Store = {
  name: "Trader Joe's",
};

function rootReducer(
  state: RootState = { menu_list: { items: [] }, menus: [] },
  action
) {
  return state;
}

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

const preloadedState: RootState = { menu_list: { items }, menus: [] };

const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

export default store;
