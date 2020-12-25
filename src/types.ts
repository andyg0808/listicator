import * as R from "ramda";
/*
   Actions:
   - reorder
   -

   Datatypes:
   - Recipe
   has list<Order>
   - Menu
   has list<Recipe>
   Menu -> Trip
   - Ingredient
   has name
   uniquely identified somehow
   needs properties
   has sequence<Store> for store preference order
   - Order
   has quantity
   has Ingredient
   has Unit
   - Trip
   has collection<Order>
   Trip -> list<ShoppingList>
   - ShoppingList
   has sequence<Order>
   has Store
 */

/**
 * A list of ingredients and amounts to make
 */
export interface Recipe {
  ingredients: Array<Order>;
}

/**
 * A unit for an ingredient
 */
export type Unit = String;

/**
 * A single ingredient in some amount. The kind of entry you would
 * expect on a recipe
 */
export interface Order {
  ingredient: Ingredient;
  amount: Amount;
}

/**
 * A group of the same ingredient with amounts.
 *
 * It might be preferable to combine the amounts, but that's more
 * decoration than enforced right now.
 */
export interface TotalOrder {
  ingredient: Ingredient;
  amount: Array<Amount>;
}

/**
 * A class to represent an amount of an ingredient
 */
export interface Amount {
  quantity: number | null;
  unit: Unit | null;
}

/**
 * A list of recipes to make
 */
export interface Menu {
  recipes: Array<Recipe>;
}

/**
 * A product which can be bought and belongs in a menu
 */
export interface Ingredient {
  name: string;
}

/**
 * The list of ingredients needed to make all the recipes in a menu.
 */
export interface MenuList {
  items: Array<TotalOrder>;
}

/**
 * A place where ingredients can be bought.
 */
export interface Store {
  name: string;
}

/**
 * The list of shopping lists to get for a given menu plan
 */
export interface Trip {
  lists: Array<ShoppingList>;
}

export const updateTripLists = R.over(R.lensProp("lists"));

/**
 * The list of items to get at a store
 */
export interface ShoppingList {
  items: Array<TotalOrder>;
  store: Store;
}

export const updateShoppingListItems = R.over(R.lensProp("items"));

export type IngredientId = number;
export type StoreId = number;

/**
 * The order of ingredients in some store
 */
export type StorePreferenceMap = Record<IngredientId, StoreId>;

/**
 * The preference order for each store which sells this ingredient.
 */
export type ShoppingOrderMap = Record<StoreId, Record<IngredientId, number>>;

export interface StorePreferenceList {
  item: Ingredient;
  stores: Array<Store>;
}

export interface ShoppingOrder {
  store: Store;
  items: Array<Ingredient>;
}
