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

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
