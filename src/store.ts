import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import { reducer as shoppingOrderReducer } from "./shopping_order";
import { reducer as storePreferenceReducer } from "./store_preference";
import { reducer as menuSelectionsReducer } from "./menu_selections";
import { reducer as recipeReducer } from "./recipes";

const rootReducer = combineReducers({
  recipes: recipeReducer,
  shoppingOrder: shoppingOrderReducer,
  storePreference: storePreferenceReducer,
  menuSelections: menuSelectionsReducer,
});

const saveToLocalStore = (storeAPI) => (next) => (action) => {
  const result = next(action);
  const state = storeAPI.getState();
  console.log("Saving to localstore", state);
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
