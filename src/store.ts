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
  ShoppingOrder,
  Store,
  TotalOrder,
  ShoppingOrderMap,
} from "./types";

import { moveItemsDown } from "./sequence";

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
  fromIdx: number;
  toIdx: number;
  displayOrder: string[];
}

type OrderMapping = Record<string, number>;
function moveDown(mapping: OrderMapping, event: ReorderEvent): OrderMapping {
  console.log("Move down", event);
  console.log(mapping);
  const { fromIdx, toIdx, displayOrder } = event;
  const pushedItems: string[] = displayOrder.slice(fromIdx + 1, toIdx + 1);
  const mappedItems = R.filter((i) => R.has(i, mapping), pushedItems);
  const forwardedMapping = mappedItems.reduce((mapping, i) => {
    return R.over(R.lensProp(i), (idx) => idx - 1, mapping);
  }, mapping);
  if (mappedItems) {
    const targetIdx = mapping[mappedItems[mappedItems.length - 1]];
    return R.assoc(event.name, targetIdx, forwardedMapping);
  } else {
    const targetIdx = toIdx;
    return R.assoc(event.name, targetIdx, forwardedMapping);
  }
}
function moveUp(mapping: OrderMapping, event: ReorderEvent): OrderMapping {
  console.log("Move up", event);
  console.log(mapping);
  const { fromIdx, toIdx, displayOrder } = event;
  const pushedItems: string[] = displayOrder.slice(toIdx, fromIdx);
  const mappedItems = R.filter((i) => R.has(i, mapping), pushedItems);
  const forwardedMapping = mappedItems.reduce((mapping, i) => {
    return R.over(R.lensProp(i), (idx) => idx + 1, mapping);
  }, mapping);
  const targetIdx = mappedItems ? mapping[mappedItems[0]] : toIdx;
  return R.assoc(event.name, targetIdx, forwardedMapping);
}

const shoppingOrderSlice = createSlice({
  name: "shoppingOrder",
  initialState: {} as Record<string, OrderMapping>,
  reducers: {
    reorder(state, action: PayloadAction<ReorderEvent>) {
      const payload = action.payload;
      const storeLens = R.lensProp(payload.store);
      return R.over(
        storeLens,
        (mapping) => {
          if (!mapping) {
            return { [payload.name]: payload.toIdx };
          }
          if (payload.fromIdx < payload.toIdx) {
            return moveDown(mapping, payload);
          } else {
            return moveUp(mapping, payload);
          }
        },
        state
      );
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
