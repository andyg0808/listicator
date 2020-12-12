import { configureStore, createAction } from "@reduxjs/toolkit";
import {
  Ingredient,
  Store,
  ShoppingOrder,
  ShoppingList,
  Order,
  MenuList,
  Menu,
} from "./types";

export interface RootState {
  menu_list: MenuList;
  menus: Menu[];
}

const trader_joes: Store = {
  name: "Trader Joe's",
  item_order: [],
};

function rootReducer(state: RootState = { menu_list: { items: [] } }, action) {
  return state;
}

const items: Array<Order> = [
  { ingredient: { name: "Sourdough bread" }, quantity: 2, unit: "C" },
  { ingredient: { name: "Spaghetti" }, quantity: 1, unit: "lb" },
];
const list: ShoppingList = {
  items: items,
  store: trader_joes,
};

const preloadedState: RootState = { menu_list: { items } };

const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

export default store;
