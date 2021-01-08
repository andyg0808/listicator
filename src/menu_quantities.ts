import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";

import { MenuQuantityMap } from "./types";

export interface SetMenuQuantity {
  name: string;
  quantity: number;
}

const menuQuantitySlice = createSlice({
  name: "menuQuantitySlice",
  initialState: {} as MenuQuantityMap,
  reducers: {
    setMenuQuantity(state, action: PayloadAction<SetMenuQuantity>) {
      const payload = action.payload;
      if (payload.quantity <= 0) {
        // The checkboxes should be used instead of zero
        return state;
      }
      return R.assoc(payload.name, payload.quantity, state);
    },
  },
});

export const { setMenuQuantity } = menuQuantitySlice.actions;
export const reducer = menuQuantitySlice.reducer;
