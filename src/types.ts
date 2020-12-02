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

export interface Recipe {
  ingredients: Array<Order>;
}

export type Unit = String;

export interface Order {
  ingredient: Ingredient;
  quantity: number;
  unit: Unit;
}

export interface Menu {
  recipes: Array<Recipe>;
}

export interface Ingredient {
  name: string;
}

export interface StorePreferenceList {
  item: Ingredient;
  stores: Array<Store>;
}

export interface Store {
  name: string;
  item_order: Array<Ingredient>;
}

export interface Trip {
  lists: Set<ShoppingList>;
}

export interface ShoppingList {
  items: Array<Order>;
  store: Store;
}

export interface ShoppingOrder {
  store: Store;
  items: Array<Ingredient>;
}
