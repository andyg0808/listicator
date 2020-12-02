import { configureStore, createAction } from "@reduxjs/toolkit";
import { Ingredient, Store, ShoppingOrder, ShoppingList, Order } from "./types";

function rootReducer(state = {}, action) {
  return state;
}

const items: Array<Order> = [
  { ingredient: { name: "Sourdough bread" }, quantity: 2, unit: "C" },
  { ingredient: { name: "Spaghetti" }, quantity: 1, unit: "lb" },
];
const trader_joes: Store = {
  name: "Trader Joe's",
  item_order: [],
};
const list: ShoppingList = {
  items: items,
  store: trader_joes,
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: { list },
});

export default store;
