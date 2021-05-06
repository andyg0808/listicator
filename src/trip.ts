/** @jsxImportSource @emotion/react */
import React from "react";
import * as R from "ramda";

import { useSelector } from "react-redux";

import { Trip, updateTripLists, ShoppingList } from "./types";
import { RootState, recipeSelector } from "./store";
import { recipesToTrip, multiply } from "./transforms";
import { sortByOrder } from "./shopping_order";

export function useSortedTrip(): Trip {
  const allRecipes = useSelector(recipeSelector);
  const selected = useSelector((store: RootState) => store.menuSelections);
  const quantities = useSelector((store: RootState) => store.menuQuantities);
  const stores = useSelector((store: RootState) => store.storeList);
  const recipes = React.useMemo(
    () => multiply(quantities, allRecipes).filter((r) => selected[r.title]),
    [allRecipes, selected, quantities]
  );
  const storePreference = useSelector(
    (store: RootState) => store.storePreference
  );
  const trip = recipesToTrip(
    recipes,
    storePreference,
    "Undecided",
    new Set(stores.map((s) => s.name))
  );
  const sortOrder = useSelector((store: RootState) => store.shoppingOrder);
  const sortedTrip = updateTripLists(
    R.map((i: ShoppingList) => sortByOrder(sortOrder, i)),
    trip
  );
  return sortedTrip;
}
