import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";
import {
  TotalOrder,
  getIngredientName,
  ShoppingList,
  StoreOrderMap,
  ShoppingOrderMap,
} from "./types";

export interface InsertItemEvent {
  name: string;
  store: string;
  atIdx: number;
  displayOrder: string[];
}

export function insertItemIntoMapping(
  mapping: StoreOrderMap,
  event: InsertItemEvent
): StoreOrderMap {
  const { atIdx, displayOrder } = event;

  const previousItem: string | undefined = displayOrder[atIdx - 1];
  const previousIdx: number | undefined = mapping[previousItem];
  const targetIdx = previousIdx ? previousIdx + 1 : atIdx;

  const pushedItems: string[] = displayOrder.slice(atIdx);
  const mappedItems = R.filter((i) => R.has(i, mapping), pushedItems);
  const [_, forwardedMapping] = mappedItems.reduce(
    (acc, i) => {
      const [last, mapping] = acc;
      const current = mapping[i];
      if (current > last + 1) {
        return [last, mapping];
      }
      return [current, R.over(R.lensProp(i), (idx) => idx + 1, mapping)];
    },
    [targetIdx, mapping]
  );

  return R.assoc(event.name, targetIdx, forwardedMapping);
}

export function insertItemReducer(
  state: ShoppingOrderMap,
  action: PayloadAction<InsertItemEvent>
) {
  const payload = action.payload;
  const storeLens = R.lensProp<ShoppingOrderMap>(payload.store);
  return R.over(
    storeLens,
    (mapping) => {
      if (!mapping) {
        return { [payload.name]: payload.atIdx };
      }
      return insertItemIntoMapping(mapping, payload);
    },
    state
  );
}

export interface ReorderEvent {
  name: string;
  store: string;
  fromIdx: number;
  toIdx: number;
  displayOrder: string[];
}

function moveDown(mapping: StoreOrderMap, event: ReorderEvent): StoreOrderMap {
  const { fromIdx, toIdx, displayOrder } = event;

  const pushedItems: string[] = displayOrder.slice(fromIdx + 1, toIdx + 1);
  const mappedItems = R.filter((i) => R.has(i, mapping), pushedItems);
  const forwardedMapping = mappedItems.reduceRight(
    (mapping, i) => R.over(R.lensProp(i), (idx) => idx - 1, mapping),
    mapping
  );

  const findTarget = () => {
    const finalItem = R.last(mappedItems);
    if (finalItem === undefined) {
      return toIdx;
    }
    const finalIdx = mapping[finalItem];
    return finalIdx < toIdx ? toIdx : finalIdx;
  };
  return R.assoc(event.name, findTarget(), forwardedMapping);
}

function moveUp(mapping: StoreOrderMap, event: ReorderEvent): StoreOrderMap {
  const { fromIdx, toIdx, displayOrder } = event;

  const previousItem: string | undefined = displayOrder[toIdx - 1];
  const previousIdx: number | undefined = mapping[previousItem];
  const targetIdx = previousIdx ? previousIdx + 1 : toIdx;

  const pushedItems: string[] = displayOrder.slice(toIdx, fromIdx);
  const mappedItems = R.filter((i) => R.has(i, mapping), pushedItems);
  const forwardedMapping = mappedItems.reduceRight(
    (mapping, i) => R.over(R.lensProp(i), (idx) => idx + 1, mapping),
    mapping
  );

  return R.assoc(event.name, targetIdx, forwardedMapping);
}

export function move(mapping: StoreOrderMap, event: ReorderEvent) {
  if (event.fromIdx === event.toIdx) {
    return mapping;
  } else if (event.fromIdx < event.toIdx) {
    return moveDown(mapping, event);
  } else {
    return moveUp(mapping, event);
  }
}

export function reorderReducer(
  state: ShoppingOrderMap,
  action: PayloadAction<ReorderEvent>
) {
  const payload = action.payload;
  const storeLens = R.lensProp<ShoppingOrderMap>(payload.store);
  return R.over(
    storeLens,
    (mapping) => {
      if (!mapping) {
        return { [payload.name]: payload.toIdx };
      }
      return move(mapping, payload);
    },
    state
  );
}

const shoppingOrderSlice = createSlice({
  name: "shoppingOrder",
  initialState: {} as ShoppingOrderMap,
  reducers: {
    insertItem: insertItemReducer,
    reorder: reorderReducer,
  },
});

export const { insertItem, reorder } = shoppingOrderSlice.actions;
export const reducer = shoppingOrderSlice.reducer;

export function sortByOrder(
  sortOrder: ShoppingOrderMap,
  l: ShoppingList
): ShoppingList {
  const storeOrder = sortOrder[l.store.name];
  // If no information is available about the ordering for the
  // store, we have to treat everything as being a "remaining"
  if (!storeOrder) {
    const sorted = R.sortBy((i: TotalOrder) => i.ingredient.name, l.items);
    return R.assoc("items", sorted, l);
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
  storeOrder: StoreOrderMap
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
