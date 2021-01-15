import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PeerData {
  peerid: string;
}

const peerSlice = createSlice({
  name: "peerSlice",
  initialState: {} as PeerData,
  reducers: {
    setPeerId(state, action: PayloadAction<string>) {
      state.peerid = action.payload;
    },
  },
});

export const { setPeerId } = peerSlice.actions;
export const reducer = peerSlice.reducer;
