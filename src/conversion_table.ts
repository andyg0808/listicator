import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Density, DensityTable } from "./types";

const conversionTableSlice = createSlice({
  name: "conversionTableSlice",
  initialState: [] as DensityTable,
  reducers: {
    setConversion(state, action: PayloadAction<Density>) {
      const payload = action.payload;
      return state
        .filter((d: Density) => !matchDensity(d, payload))
        .concat([payload]);
    },
  },
});

function matchDensity(left: Density, right: Density) {
  return left.from === right.from && left.to === right.to;
}

export const { setConversion } = conversionTableSlice.actions;
export const reducer = conversionTableSlice.reducer;
