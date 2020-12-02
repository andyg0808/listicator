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
