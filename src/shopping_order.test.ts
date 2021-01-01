import {
  move,
  sortByOrder,
  InsertItemEvent,
  OrderMapping,
  ReorderEvent,
  insertItemIntoMapping,
  merge,
} from "./shopping_order";
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

function sortDisplayOrder(sortOrder: StoreOrderMap, displayOrder: string[]) {
  const [positioned, remaining] = R.partition(
    (i) => R.has(i, storeOrder),
    displayOrder
  );

  remaining.sort();
  positioned.sort();

  return mergeDisplayOrder(0, positioned, remaining, sortOrder);
}

function mergeDisplayOrder(
  idx: number,
  positioned: string[],
  remaining: string[],
  storeOrder: StoreOrderMap
): string[] {
  if (positioned.length == 0) {
    return remaining;
  } else if (remaining.length == 0) {
    return positioned;
  }

  const name = positioned[0];
  const position = storeOrder[name];

  if (idx == position) {
    return R.prepend(
      positioned[0],
      merge(idx + 1, positioned.slice(1), remaining, storeOrder)
    );
  } else {
    return R.prepend(
      remaining[0],
      merge(idx + 1, positioned, remaining.slice(1), storeOrder)
    );
  }
}

function generatePositionInformation({
  fromIdx,
  toIdx,
  displayed,
  mappedIndexes,
}) {
  const mapping = Object.fromEntries(
    R.zipWith((name, idx) => [name, idx], displayed, mappedIndexes)
  );

  const displayOrder = sortDisplayOrder(displayed);

  const name = displayed[fromIdx];
  const event: ReorderEvent = {
    name: mover,
    store: "n/a",
    fromIdx: fromIdx,
    toIdx: toIdx,
    displayed,
  };
  return [mapping, event];
}

const fc_displayed = fc.set(fc.string());
const fc_state = fc_displayed
  .chain((displayed) =>
    fc.record({
      fromIdx: fc.nat(displayed.length - 1),
      toIdx: fc.nat(displayed.length - 1),
      displayed,
      mappedIndexes: fc.set(fc.nat(), { maxLength: displayed.length }),
    })
  )
  .map(generatePositionInformation);

describe("move", () => {
  it("places the targeted item at the target index", () => {
    fc.assert(
      fc.property(fc_state, ([mapping, event]) => {
        const updated = move(mapping, event);
        expect(updated[event.name]).toEqual(event.toIdx);
      })
    );
  });
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
