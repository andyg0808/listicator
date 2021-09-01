import * as R from "ramda";
import Fraction from "fraction.js";
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
  title: RecipeTitle;
  ingredients: Array<Order>;
}

/**
 * A unit for an ingredient
 */
export type Unit = string;

/**
 * A single ingredient in some amount. The kind of entry you would
 * expect on a recipe
 */
export interface Order {
  ingredient: Ingredient;
  amount: Amount<DatabaseNumber>;
}

/**
 * A group of the same ingredient with amounts.
 *
 * It might be preferable to combine the amounts, but that's more
 * decoration than enforced right now.
 */
export interface TotalOrder {
  ingredient: Ingredient;
  amount: Array<Amount<DisplayNumber>>;
}

export function totalOrderFromOrder(order: Order): TotalOrder {
  return {
    ...order,
    amount: [databaseAmountToDisplayAmount(order.amount)],
  };
}

export const getIngredientName = (o: TotalOrder) => o?.ingredient?.name;
export function getDescription(order: TotalOrder): string {
  const amount = order.amount
    .map((a: Amount<DisplayNumber>) => {
      if (a.quantity === null) {
        return a.unit || "";
      }
      if (a.unit === null) {
        return a.quantity.toFraction();
      }
      const unit = a.quantity.valueOf() > 1 ? a.unit + "s" : a.unit;
      if (a.unit === "gram") {
        // Special-case grams, since they're typically worked with in near-integer quantities
        return `${a.quantity.round().toString(1)} ${unit}`;
      }
      return `${a.quantity.toFraction()} ${unit}`;
    })
    .join(" & ");
  const name = order.ingredient.name;
  return `${amount} ${name}`;
}

export type DatabaseNumber = null | number | StoredFraction;
export type DisplayNumber = null | Fraction;

export interface StoredFraction {
  n: number;
  d: number;
}

export function databaseNumberToString(n: DatabaseNumber): string {
  if (typeof n == "number") {
    return n.toPrecision(2);
  } else if (n === null) {
    return "1";
  } else {
    return new Fraction(n).toFraction();
  }
}

export function displayNumberToString(n: DisplayNumber): string {
  if (n === null) {
    return "1";
  } else {
    return n.toFraction();
  }
}

export function databaseNumberToDisplayNumber(
  n: DatabaseNumber
): DisplayNumber {
  if (n === null) {
    return null;
  } else {
    return toFraction(n);
  }
}

function toFraction(n: number | StoredFraction): Fraction {
  if (typeof n == "number") {
    return new Fraction(n);
  } else {
    return new Fraction(n);
  }
}

export function databaseNumberMult(
  n: DatabaseNumber,
  m: DatabaseNumber
): DatabaseNumber {
  if (n === null || m === null) {
    return null;
  }
  const nFrac = toFraction(n);
  const mFrac = toFraction(m);
  return nFrac.mul(mFrac);
}

/**
 * A class to represent an amount of an ingredient
 */
export interface Amount<Number> {
  quantity: Number;
  unit: Unit | null;
}

export function databaseAmountToDisplayAmount(
  amount: Amount<DatabaseNumber>
): Amount<DisplayNumber> {
  return {
    ...amount,
    quantity: databaseNumberToDisplayNumber(amount.quantity),
  };
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
 * A type for the name of a store
 */
export type StoreName = string;

/**
 * A place where ingredients can be bought.
 */
export interface Store {
  name: StoreName;
}

/**
 * The list of shopping lists to get for a given menu plan
 */
export interface Trip {
  lists: Array<ShoppingList>;
}

export const updateTripLists = R.over(R.lensProp<Trip>("lists"));

/**
 * The list of items to get at a store
 */
export interface ShoppingList {
  items: Array<TotalOrder>;
  store: Store;
}

export const updateShoppingListItems = R.over(
  R.lensProp<ShoppingList>("items")
);

export type IngredientId = string;
export type StoreId = string;

/**
 * The preference order for each store which sells this ingredient.
 */
export type StorePreferenceMap = Record<IngredientId, StoreId>;

/**
 * The order of ingredients in a store
 */
export type StoreOrderMap = Record<IngredientId, number>;

/**
 * The order of ingredients in stores
 */
export type ShoppingOrderMap = Record<StoreId, StoreOrderMap>;

export type RecipeTitle = string;
export type MenuSelectionMap = Record<RecipeTitle, boolean>;
export type MenuQuantityMap = Record<RecipeTitle, number>;
export type PurchaseMap = Record<IngredientId, boolean>;

export interface Conversion {
  from: Unit;
  to: Unit;
  value: Fraction;
}

export interface Density extends Conversion {
  ingredient: IngredientId;
}
export type DensityTable = Array<Density>;
