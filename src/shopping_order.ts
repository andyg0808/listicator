import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";
import { TotalOrder, getIngredientName, ShoppingList } from "./types";

export interface ReorderEvent {
  name: string;
  store: string;
  fromIdx: number;
  toIdx: number;
  displayOrder: string[];
}

export type OrderMapping = Record<string, number>;
export type SortOrder = Record<string, OrderMapping>;
function moveDown(mapping: OrderMapping, event: ReorderEvent): OrderMapping {
  console.log("Move down", event);
  console.log(mapping);
  const { fromIdx, toIdx, displayOrder } = event;
  const pushedItems: string[] = displayOrder.slice(fromIdx + 1, toIdx + 1);
  const mappedItems = R.filter((i) => R.has(i, mapping), pushedItems);
  const forwardedMapping = mappedItems.reduce((mapping, i) => {
    return R.over(R.lensProp(i), (idx) => idx - 1, mapping);
  }, mapping);
  // if (mappedItems) {
  //   const targetIdx = mapping[mappedItems[mappedItems.length - 1]];
  //   return R.assoc(event.name, targetIdx, forwardedMapping);
  // } else {
  return R.assoc(event.name, toIdx, forwardedMapping);
  // }
}

export function moveUp(
  mapping: OrderMapping,
  event: ReorderEvent
): OrderMapping {
  console.log("Move up", event);
  console.log(mapping);
  const { fromIdx, toIdx, displayOrder } = event;
  const pushedItems: string[] = displayOrder.slice(toIdx, fromIdx);
  const mappedItems = R.filter((i) => R.has(i, mapping), pushedItems);
  const forwardedMapping = mappedItems.reduce((mapping, i) => {
    return R.over(R.lensProp(i), (idx) => idx + 1, mapping);
  }, mapping);
  return R.assoc(event.name, toIdx, forwardedMapping);
}

export function reorderReducer(state, action: PayloadAction<ReorderEvent>) {
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
}

const shoppingOrderSlice = createSlice({
  name: "shoppingOrder",
  initialState: {} as SortOrder,
  reducers: {
    reorder: reorderReducer,
  },
});

export const { reorder } = shoppingOrderSlice.actions;
export const reducer = shoppingOrderSlice.reducer;

export function sortByOrder(
  sortOrder: SortOrder,
  l: ShoppingList
): ShoppingList {
  const storeOrder = sortOrder[l.store.name];
  // If no information is available about the ordering for the
  // store, we can't usefully sort at all.
  if (!storeOrder) {
    return l;
  }
  const [positioned, remaining] = R.partition(
    (i) => R.has(i.ingredient.name, storeOrder),
    l.items
  );

  const sortedRemaining = R.sortBy(
    (i: TotalOrder) => i.ingredient.name,
    remaining
  );

  const sortedPositioned = R.sortBy(
    (i: TotalOrder) => storeOrder[i.ingredient.name],
    positioned
  );

  const sorted = merge(0, sortedPositioned, sortedRemaining, storeOrder);
  return R.assoc("items", sorted, l);
}

export function merge(
  idx: number,
  positioned: TotalOrder[],
  remaining: TotalOrder[],
  storeOrder: OrderMapping
): TotalOrder[] {
  if (positioned.length == 0) {
    return remaining;
  } else if (remaining.length == 0) {
    return positioned;
  }

  const name = getIngredientName(positioned[0]);
  const position = storeOrder[name];

  if (idx == position) {
    return R.prepend(
      positioned[0],
      merge(idx + 1, positioned.slice(1), remaining, storeOrder)
    );
  } else {
    return R.prepend(
      remaining[0],
      merge(idx + 1, positioned, remaining.slice(1), storeOrder)
    );
  }
}
