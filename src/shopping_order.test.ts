import { moveUp, ReorderEvent, merge, OrderMapping } from "./shopping_order";
import fc from "fast-check";

describe("moveUp", () => {
  it("should place an item targeted above all indexed items at the target index", () => {
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
