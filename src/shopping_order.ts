import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda"


export interface ReorderEvent {
  name: string;
  store: string;
  fromIdx: number;
  toIdx: number;
  displayOrder: string[];
}

export type OrderMapping = Record<string, number>;
export type SortOrder = Record<string, OrderMapping>
function moveDown(mapping: OrderMapping, event: ReorderEvent): OrderMapping {
  console.log("Move down", event);
  console.log(mapping);
  const { fromIdx, toIdx, displayOrder } = event;
  const pushedItems: string[] = displayOrder.slice(fromIdx + 1, toIdx + 1);
  const mappedItems = R.filter((i) => R.has(i, mapping), pushedItems);
  const forwardedMapping = mappedItems.reduce((mapping, i) => {
    return R.over(R.lensProp(i), (idx) => idx - 1, mapping);
  }, mapping);
  if (mappedItems) {
    const targetIdx = mapping[mappedItems[mappedItems.length - 1]];
    return R.assoc(event.name, targetIdx, forwardedMapping);
  } else {
    const targetIdx = toIdx;
    return R.assoc(event.name, targetIdx, forwardedMapping);
  }
}
function moveUp(mapping: OrderMapping, event: ReorderEvent): OrderMapping {
  console.log("Move up", event);
  console.log(mapping);
  const { fromIdx, toIdx, displayOrder } = event;
  const pushedItems: string[] = displayOrder.slice(toIdx, fromIdx);
  const mappedItems = R.filter((i) => R.has(i, mapping), pushedItems);
  const forwardedMapping = mappedItems.reduce((mapping, i) => {
    return R.over(R.lensProp(i), (idx) => idx + 1, mapping);
  }, mapping);
  const targetIdx = mappedItems ? mapping[mappedItems[0]] : toIdx;
  return R.assoc(event.name, targetIdx, forwardedMapping);
}

const shoppingOrderSlice = createSlice({
  name: "shoppingOrder",
  initialState: {} as SortOrder,
  reducers: {
    reorder(state, action: PayloadAction<ReorderEvent>) {
      const payload = action.payload;
      const storeLens = R.lensProp(payload.store);
      return R.over(
        storeLens,
        (mapping) => {
          if (!mapping) {
            return { [payload.name]: payload.toIdx };
          }
          if (payload.fromIdx < payload.toIdx) {
            return moveDown(mapping, payload);
          } else {
            return moveUp(mapping, payload);
          }
        },
        state
      );
    },
  },
});

export const { reorder } = shoppingOrderSlice.actions;
export const reducer = shoppingOrderSlice.reducer
