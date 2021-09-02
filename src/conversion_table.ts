import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Density, DensityTable, IngredientId, Unit } from "./types";

type DensityKey = IngredientId;

const conversionTableSlice = createSlice({
  name: "conversionTableSlice",
  initialState: [] as DensityTable,
  reducers: {
    setConversion(state, action: PayloadAction<Density>) {
      const payload = action.payload;
      return state
        .filter((d: Density) => d.ingredient !== payload.ingredient)
        .concat([payload]);
    },
    deleteConversion(state, action: PayloadAction<DensityKey>) {
      return state.filter((d: Density) => d.ingredient !== action.payload);
    },
  },
});

export const { setConversion, deleteConversion } = conversionTableSlice.actions;
export const reducer = conversionTableSlice.reducer;
