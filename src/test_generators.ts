import fc from "fast-check";
import {
  StoreOrderMap,
  Order,
  Amount,
  StoredFraction,
  DatabaseNumber,
} from "./types";
import * as R from "ramda";
import { merge } from "./shopping_order";
import { unitsRegex } from "./lexer";
import Fraction from "fraction.js";

export const fc_unit = fc
  .string({ minLength: 1 })
  .map((s) => s.trim())
  .filter((s) => !s.includes("!") && s.length > 0 && !unitsRegex.test(s));

export const fc_ingredient_name = fc
  .string({ minLength: 1 })
  .map((s) => s.trim())
  .filter((s) => !s.includes("!") && s.length > 1);

const seen = new Set();
export const fc_ingredient = fc
  .record({
    name: fc_ingredient_name,
  })
  .filter(({ name }) => {
    if (seen.has(name)) {
      return false;
    } else {
      seen.add(name);
      return true;
    }
  });

export const fc_quantity = fc.option(
  fc
    .record({
      n: fc.nat().map((n) => n + 1),
      d: fc.nat().map((n) => n + 1),
    })
    .map((n) => new Fraction(n))
);

export const fc_amount = fc.record({
  quantity: fc_quantity,
  unit: fc.option(fc_unit),
});

export const fc_order = fc.record({
  ingredient: fc_ingredient,
  amount: fc_amount,
});

export const totalOrder = fc.record({
  ingredient: fc_ingredient,
  amount: fc.array(fc_amount),
});

function normalizeAmount(
  amount: Amount<DatabaseNumber>
): Amount<Fraction | null> {
  return {
    quantity: normalizeQuantity(amount),
    unit: amount.unit,
  };
}

function normalizeQuantity(amount: Amount<DatabaseNumber>): Fraction | null {
  const quantity = amount.quantity;
  if (quantity === null) {
    if (amount.unit !== null) {
      return new Fraction(1);
    } else {
      return null;
    }
  } else if (typeof quantity == "object") {
    return new Fraction(quantity.n, quantity.d);
  } else {
    return new Fraction(quantity);
  }
}

export function normalizeOrder(order: Order) {
  return R.over(R.lensProp("amount"), normalizeAmount, order);
}
