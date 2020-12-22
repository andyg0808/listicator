import {
  Ingredient,
  Menu,
  MenuList,
  Recipe,
  Order,
  ShoppingList,
  Store,
  TotalOrder,
  Trip,
} from "./types";
import { groupBy } from "ramda";

export function tripFromMenuList(menuList: MenuList): Trip {
  const stores: { [index: string]: Array<TotalOrder> } = groupBy(
    (item) => "Trader Joe's",
    menuList.items
  );
  const store: Store = { name: "Trader Joe's" };
  const lists: Array<ShoppingList> = Object.entries(stores).map(
    ([storeid, items]: [string, Array<TotalOrder>]): ShoppingList => {
      return {
        items: items,
        store: store,
      };
    }
  );

  return {
    lists,
  };
}

export function menuListFromMenu(menu: Menu): MenuList {
  const items = menu.recipes.flatMap((recipe) => recipe.ingredients);
  const totalItems: Record<string, Order[]> = groupBy(
    (order) => order.ingredient.name,
    items
  );
  const orders: TotalOrder[] = Object.entries(totalItems).map(
    ([name, values]): TotalOrder => {
      return {
        ingredient: { name },
        amount: values.map((v) => v.amount),
      };
    }
  );
  return {
    items: orders,
  };
}

export function recipesToTrip(recipes: Recipe[]): Trip {
  const menu = { recipes };
  const menuList = menuListFromMenu(menu);
  return tripFromMenuList(menuList);
}
