import { unparse, parse } from "./parser";
import fc from "fast-check";
import { fc_order, normalizeOrder } from "./test_generators";
import { Order } from "./types";

declare global {
  namespace jest {
    interface Matchers<R> {
      toParseAs(expected: null | Order[]): R;
    }
  }
}

expect.extend({
  toParseAs(text, expected) {
    const options = {
      comment: "Deep equality",
      isNot: this.isNot,
      promise: this.promise,
    };
    const parsed = parse(text);
    const pass = this.equals(parsed, expected);
    if (pass) {
      return {
        message: () =>
          this.utils.matcherHint("toParseAs", undefined, undefined, options) +
          "\n\n" +
          `Expected: not ${this.utils.printExpected(expected)}\n` +
          `Passed: ${this.utils.printReceived(text)}\n` +
          `Parsed as: ${this.utils.printReceived(parsed)}`,
        pass,
      };
    } else {
      const diffString = this.utils.diff(expected, parsed, {
        expand: this.expand,
      });
      return {
        message: () =>
          this.utils.matcherHint("toParseAs", undefined, undefined, options) +
          "\n\n" +
          (diffString && diffString.includes("- Expect")
            ? `Difference:\n\n${diffString}\n\nUnparse:\n'${text}'`
            : `Expected: ${this.utils.printExpected(expected)}\n` +
              `Passed: ${this.utils.printReceived(text)}\n` +
              `Parsed as: ${this.utils.printReceived(parsed)}`),
        pass,
      };
    }
  },
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
});
