import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Recipe } from "./types";

interface PeerData {
  peerid: string | null;
  recipes: Recipe[];
}

const peerSlice = createSlice({
  name: "peerSlice",
  initialState: { recipes: [], peerid: null } as PeerData,
  reducers: {
    setPeerId(state, action: PayloadAction<string>) {
      state.peerid = action.payload;
    },
    receiveRecipe(state, action: PayloadAction<Recipe>) {
      if (!state.recipes) {
        state.recipes = [];
      }
      state.recipes.push(action.payload);
    },
    removeReceivedRecipe(state, action: PayloadAction<string>) {
      if (!state.recipes) {
        state.recipes = [];
      }
      state.recipes = state.recipes.filter(
        (r: Recipe) => r.title !== action.payload
      );
    },
  },
});

export const { setPeerId, receiveRecipe, removeReceivedRecipe } =
  peerSlice.actions;
export const reducer = peerSlice.reducer;
