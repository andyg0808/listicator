import {
  move,
  sortByOrder,
  InsertItemEvent,
  OrderMapping,
  ReorderEvent,
  insertItemIntoMapping,
  merge,
} from "./shopping_order";
import { totalOrder } from "./test_generators";
import fc from "fast-check";
import * as R from "ramda";

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

const insert_cases = [
  [3, 3],
  [5, 5],
  [15, 15],
  [16, 18],
  [18, 26],
  [20, 54],
];

describe("insertItemIntoMapping", () => {
  it.each(insert_cases)(
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

describe("move", () => {
  const move_down_cases = [
    [0, 3, 3, "one", 0],
    [1, 3, 3, "zero", 0],
    [3, 4, 4, "one", 1],
    [11, 14, 14, "fifteen", 17],
    [11, 15, 17, "fifteen", 16],
    [0, 19, 53, "six", 5],
  ];
  it.each(move_down_cases)(
    "moves %d down to %d",
    (fromIdx, toIdx, expected, other, otherExpected) => {
      const name = displayOrder[fromIdx];
      const event: ReorderEvent = {
        name,
        store: "n/a",
        fromIdx,
        toIdx,
        displayOrder,
      };
      const actual = move(mapping, event);
      expect(actual).toHaveProperty(name, expected);
      expect(actual).toHaveProperty(other, otherExpected);
    }
  );
  const move_up_cases = [
    [19, 0, 0, "fifteen", 18],
    [16, 2, 2, "thirteen", 14],
    [18, 17, 19, "seventeen", 26],
  ];
  it.each(move_up_cases)(
    "moves %d up to %d",
    (fromIdx, toIdx, expected, other, otherExpected) => {
      const name = displayOrder[fromIdx];
      const event: ReorderEvent = {
        name,
        store: "n/a",
        fromIdx,
        toIdx,
        displayOrder,
      };
      const actual = move(mapping, event);
      expect(actual).toHaveProperty(name, expected);
      expect(actual).toHaveProperty(other, otherExpected);
    }
  );
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
