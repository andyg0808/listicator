import {
  DisplayNumber,
  MenuQuantityMap,
  StoreName,
  Ingredient,
  Menu,
  MenuList,
  Order,
  Recipe,
  ShoppingList,
  Store,
  StorePreferenceMap,
  TotalOrder,
  Trip,
  databaseAmountToDisplayAmount,
} from "./types";
import * as R from "ramda";

export function tripFromMenuList(
  menuList: MenuList,
  storePreference: StorePreferenceMap,
  defaultStore: string,
  knownStores: Set<StoreName>
): Trip {
  const stores: { [index: string]: Array<TotalOrder> } = R.groupBy((item) => {
    const store = storePreference[item.ingredient.name];
    if (!store) {
      return defaultStore;
    }
    if (knownStores.has(store)) {
      return store;
    }
    return defaultStore;
  }, menuList.items);
  const lists: Array<ShoppingList> = Object.entries(stores).map(
    ([storeid, items]: [string, Array<TotalOrder>]): ShoppingList => {
      return {
        items: items,
        store: { name: storeid },
      };
    }
  );

  return {
    lists,
  };
}

export function menuListFromMenu(menu: Menu): MenuList {
  const items = menu.recipes.flatMap((recipe: Recipe) => recipe.ingredients);
  const totalItems: Record<string, Order[]> = R.groupBy(
    (order) => order.ingredient.name,
    items
  );
  const orders: TotalOrder[] = Object.entries(totalItems).map(
    ([name, values]): TotalOrder => {
      return {
        ingredient: { name },
        amount: values.map((v) => databaseAmountToDisplayAmount(v.amount)),
      };
    }
  );
  return {
    items: orders,
  };
}

export function recipesToTrip(
  recipes: Recipe[],
  storePreference: StorePreferenceMap,
  defaultStore: string,
  knownStores: Set<StoreName>
): Trip {
  const menu = { recipes };
  const menuList = menuListFromMenu(menu);
  return tripFromMenuList(menuList, storePreference, defaultStore, knownStores);
}

export function multiply(quantities: MenuQuantityMap, recipes: Recipe[]) {
  console.log(recipes);
  return recipes.map((r: Recipe) => {
    const mult = quantities[r.title] || 1;
    return R.over(
      R.lensProp("ingredients"),
      R.map(
        R.over(R.lensPath(["amount", "quantity"]), (qty: DisplayNumber) => {
          console.log(qty);
          return qty === null ? 1 : qty.mul(mult);
        })
      ),
      r
    );
  });
}
