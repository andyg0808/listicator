import fc from "fast-check";
import { StoreOrderMap, Order, Amount } from "./types";
import * as R from "ramda";
import { merge } from "./shopping_order";
import { unitsRegex } from "./lexer";

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

export const fc_quantity = fc.option(fc.nat().map((n) => n + 1));

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

function normalizeAmount(amount: Amount): Amount {
  return {
    quantity:
      amount.unit !== null && amount.quantity === null ? 1 : amount.quantity,
    unit: amount.unit,
  };
}
export function normalizeOrder(order: Order) {
  return R.over(R.lensProp("amount"), normalizeAmount, order);
}
