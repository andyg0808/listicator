import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Store, StoreName } from "./types";
import * as R from "ramda";

function toStores(stores: StoreName[]): Store[] {
  return stores.map((store) => {
    return { name: store };
  });
}

const storeListSlice = createSlice({
  name: "storeList",
  initialState: [] as Store[],
  reducers: {
    setStores: (state, action: PayloadAction<StoreName[]>) => {
      return toStores(action.payload);
    },
  },
});

export const { setStores } = storeListSlice.actions;
export const reducer = storeListSlice.reducer;
