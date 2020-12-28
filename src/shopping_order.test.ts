import { moveUp, ReorderEvent } from "./shopping_order";
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
  it("should place an item which is targeted between shifted items at the target index", () => {
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
  it("should place the item no lower than the target index", () => {});
});
