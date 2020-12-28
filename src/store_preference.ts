import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IngredientId, StoreId, StorePreferenceMap } from "./types";
import * as R from "ramda";

interface SetStore {
  item: IngredientId;
  store: StoreId;
}

const storePreferenceSlice = createSlice({
  name: "storePreference",
  initialState: {} as StorePreferenceMap,
  reducers: {
    setStore: (state, action: PayloadAction<SetStore>) => {
      const payload = action.payload;
      return R.assoc(payload.item, payload.store, state);
    },
  },
});

export const { setStore } = storePreferenceSlice.actions;
export const reducer = storePreferenceSlice.reducer;
