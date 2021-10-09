import { unparse, parse } from "./parser";
import fc from "fast-check";
import { fc_order, normalizeOrder } from "./test_generators";
import { Order } from "./types";
import { units } from "./lexer";
import { toParseAs, toRoundTrip } from "./jest_extensions";

expect.extend({
  toParseAs,
  toRoundTrip,
});

describe("unparse", () => {
  it("unambiguously converts a list of ingredients to a string", () => {
    fc.assert(
      fc.property(fc.array(fc_order), (orders) => {
        const expected = orders.map(normalizeOrder);
        expect(unparse(orders)).toParseAs(
          expected.length === 0 ? null : expected
        );
      })
    );
  });

  it("handles tricky cases such as headerlike ingredients", () => {
    expect("!!A:").toRoundTrip();
    expect(`1 can tomato paste`).toRoundTrip();
  });

  it("uses a minimal number of exclamation points", () => {
    const unitNames = units.map((u) => u[1]);
    fc.assert(
      fc.property(fc.constantFrom(...unitNames), (unit) => {
        expect(`1 ${unit} oatmeal`).toRoundTrip();
      })
    );
  });
});
