import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";

import { PurchaseMap, IngredientId } from "./types";

const purchasedSlice = createSlice({
  name: "purchasedSlice",
  initialState: {} as PurchaseMap,
  reducers: {
    setPurchased(state, action: PayloadAction<IngredientId>) {
      const name = action.payload;
      const lens = R.lensProp<typeof state>(name);
      return R.over(lens, (v) => !v, state);
    },
  },
});

export const { setPurchased } = purchasedSlice.actions;
export const reducer = purchasedSlice.reducer;
