import {
  moveUp,
  ReorderEvent,
  merge,
  OrderMapping,
  InsertItemEvent,
  insertItemIntoMapping,
} from "./shopping_order";
import fc from "fast-check";

const mapping = {
  zero: 0,
  one: 1,
  five: 5,
  six: 6,
  seven: 7,
  ten: 10,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 17,
  sixteen: 18,
  seventeen: 25,
  eighteen: 30,
  nineteen: 53,
};
const move_cases = [
  [3, 3],
  [5, 5],
  [15, 15],
  [16, 18],
  [18, 26],
  [20, 54],
];

const displayOrder = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

describe("insertItemIntoMapping", () => {
  it.each(move_cases)(
    "gives an item inserted at index %d the sort index %d",
    (target, expected) => {
      const event: InsertItemEvent = {
        name: "inserted",
        store: "n/a",
        atIdx: target,
        displayOrder,
      };
      const actual = insertItemIntoMapping(mapping, event);
      // The item should have been inserted in the appropriate position
      expect(actual).toHaveProperty("inserted", expected);
      // A gap should prevent further elements being modified
      expect(actual).toHaveProperty("nineteen", 53);
    }
  );
});

describe("moveUp", () => {
  it("places the targeted item at the target index when in normal", () => {
    fc.assert(
      fc.property(
        fc.nat(10).filter((i) => i !== 3),
        fc.array(
          fc.string({ minLength: 1 }).filter((i) => !i.includes(".")),
          { minLength: 12 }
        ),
        (a, displayOrder) => {
          const existing = displayOrder[a];
          const state = { [existing]: a };
          const mover = displayOrder[a + 1];
          const event: ReorderEvent = {
            name: mover,
            store: "ignored",
            fromIdx: a + 1,
            toIdx: 3,
            displayOrder,
          };
          expect(moveUp(state, event)).toHaveProperty(mover, 3);
        }
      )
    );
  });
  it.skip("should place an item which is targeted between shifted items at the target index", () => {
    fc.assert(
      fc.property(
        fc.nat(10),
        fc.array(
          fc.string({ minLength: 1 }).filter((i) => !i.includes(".")),
          { minLength: 12 }
        ),
        (a, displayOrder) => {
          const mapping = Object.fromEntries(
            displayOrder.map((el, i) => [el, i + 20])
          );
          const fromIdx = a + 1;
          const mover = displayOrder[fromIdx];
          const toIdx = a;
          const event: ReorderEvent = {
            name: mover,
            store: "ignored",
            fromIdx,
            toIdx,
            displayOrder,
          };
          expect(moveUp(mapping, event)).toHaveProperty(mover, 3);
        }
      )
    );
  });
});

describe("moveDown", () => {
  it.skip("should place the item no lower than the target index", () => {});
});

const seen = new Set();
const ingredient = fc
  .record({
    name: fc.string(),
  })
  .filter(({ name }) => {
    if (seen.has(name)) {
      return false;
    } else {
      seen.add(name);
      return true;
    }
  });

const amount = fc.record({
  quantity: fc.option(fc.nat()),
  unit: fc.option(fc.string()),
});

const totalOrder = fc.record({
  ingredient: ingredient,
  amount: fc.array(amount),
});

describe("merge", () => {
  it("should place all positioned entries at their positions", () => {
    fc.assert(
      fc.property(
        fc.array(totalOrder),
        fc.array(totalOrder),
        (positioned, remaining) => {
          const storeOrder: StoreOrderMap = Object.fromEntries(
            positioned.map((p, i) => [p.ingredient.name, i])
          );
          expect(storeOrder).toBeDefined();
          const merged = merge(0, positioned, remaining, storeOrder);
          Object.entries(storeOrder).forEach(([p, i]) => {
            expect(merged[i].ingredient.name).toEqual(p);
          });
        }
      )
    );
  });
});
