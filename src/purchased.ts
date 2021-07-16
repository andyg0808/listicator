import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";

import { newList } from "./new_list";
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
  extraReducers: (builder) => {
    builder.addCase(newList, (_state, _action: PayloadAction<undefined>) => {
      return {};
    });
  },
});

export const { setPurchased } = purchasedSlice.actions;
export const reducer = purchasedSlice.reducer;
