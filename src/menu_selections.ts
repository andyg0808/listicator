import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";

import { newList } from "./new_list";
import { MenuSelectionMap } from "./types";

export interface SetMenuSelection {
  name: string;
  include: boolean;
}

const menuSelectionSlice = createSlice({
  name: "menuSelectionSlice",
  initialState: {} as MenuSelectionMap,
  reducers: {
    setMenuSelection(state, action: PayloadAction<SetMenuSelection>) {
      const payload = action.payload;
      return R.assoc(payload.name, payload.include, state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(newList, (_state, _action: PayloadAction<undefined>) => {
      return {};
    });
  },
});

export const { setMenuSelection } = menuSelectionSlice.actions;
export const reducer = menuSelectionSlice.reducer;
