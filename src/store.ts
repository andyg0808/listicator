import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, Middleware } from "redux";

import undoable from "redux-undo";

import { reducer as shoppingOrderReducer } from "./shopping_order";
import { reducer as storePreferenceReducer } from "./store_preference";
import { reducer as menuSelectionsReducer } from "./menu_selections";
import { reducer as menuQuantityReducer } from "./menu_quantities";
import { reducer as recipeReducer } from "./recipes";
import { reducer as peerReducer } from "./sync_store";
import { reducer as storeListReducer } from "./store_list";

const rootReducer = combineReducers({
  recipes: undoable(recipeReducer),
  shoppingOrder: shoppingOrderReducer,
  storePreference: storePreferenceReducer,
  menuSelections: menuSelectionsReducer,
  menuQuantities: menuQuantityReducer,
  syncStore: peerReducer,
  storeList: storeListReducer,
});

export const recipeSelector = (store: RootState) => store.recipes.present;

const saveToLocalStore: Middleware = (storeAPI) => (next) => (action) => {
  const result = next(action);
  const state = storeAPI.getState();
  window.localStorage.setItem("store", JSON.stringify(state));
  return result;
};

const fetchFromLocalStore = () => {
  const data = window.localStorage.getItem("store");
  if (!data) {
    return undefined;
  }
  return JSON.parse(data) || undefined;
};

export function resetLocalStore() {
  window.localStorage.removeItem("store");
}

const store = configureStore({
  reducer: rootReducer,
  middleware: [saveToLocalStore],
  preloadedState: fetchFromLocalStore(),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
