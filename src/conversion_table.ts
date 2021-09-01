import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Density, DensityTable, IngredientId, Unit } from "./types";

interface DensityKey {
  from: Unit;
  to: Unit;
  ingredient: IngredientId;
}

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
    deleteConversion(state, action: PayloadAction<DensityKey>) {
      return state.filter((d: Density) => !matchDensity(d, action.payload));
    },
  },
});

function matchDensity(left: DensityKey, right: DensityKey) {
  return left.from === right.from && left.to === right.to;
}

export const { setConversion, deleteConversion } = conversionTableSlice.actions;
export const reducer = conversionTableSlice.reducer;
