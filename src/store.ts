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
  fromIdx: number;
    toIdx: number;
    displayOrder: string[];
}

type OrderMapping = Record<string, number>
function moveDown(mapping: OrderMapping, event: ReorderEvent) {
    console.log("Move down", event)
    console.log(mapping)
    const {fromIdx, toIdx, displayOrder} = event
    const pushedItems: string[] =
      fromIdx < toIdx
        ? displayOrder.slice(fromIdx + 1, toIdx + 1)
        : displayOrder.slice(toIdx, fromIdx);
    let lastIdx = -1
    pushedItems.forEach(i => {
        if (mapping[i]) {
            lastIdx = mapping[i]
            // Reduce the index by 1, because all the items between
            // need to move up
            mapping[i] = mapping[i]-1
        }
    })
    if (lastIdx != -1) {
        mapping[event.name] = lastIdx
    } else {
        mapping[event.name] = toIdx
    }
}
function moveUp(mapping: OrderMapping, event: ReorderEvent) {
    console.log("Move up", event)
}

const shoppingOrderSlice = createSlice({
  name: "shoppingOrder",
  initialState: {} as Record<string, Record<string, number>>,
  reducers: {
      reorder(state, action: PayloadAction<ReorderEvent>) {
          const payload = action.payload;
          const store = payload.store;
          const mapping = state[store]
          if (!mapping) {
              state[store] = {[payload.name]: payload.toIdx}
              return
          }
          if (payload.fromIdx < payload.toIdx) {
              moveDown(mapping, payload)
          } else {
              moveUp(mapping, payload)
          }
      // if (state[payload.store]) {
      //     state[payload.store][payload.name] = payload.to;
      // } else {
      //   state[payload.store] = {[payload.name]: payload.to}
      // }
      // state[payload.store] = moveItemsDown(state[payload.store], payload.to)
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
