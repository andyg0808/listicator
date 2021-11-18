import { unparse, parse } from "./parser";
import { Order } from "./types";

declare global {
  namespace jest {
    interface Matchers<R> {
      toParseAs(expected: null | Order[]): R;
      toRoundTrip(): R;
    }
  }
}

export function toParseAs(this: jest.MatcherContext, text: any, expected: any) {
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
          ? `Difference:\n\n${diffString}\n\nInput:\n'${text}'`
          : `Expected: ${this.utils.printExpected(expected)}\n` +
            `Passed: ${this.utils.printReceived(text)}\n` +
            `Parsed as: ${this.utils.printReceived(parsed)}`),
      pass,
    };
  }
}
export function toRoundTrip(
  this: jest.MatcherContext,
  text: any,
  expected: any
) {
  const checkUnparse = (order: Order[], order_type: string) => {
    const list = unparse(order);

    if (list !== text) {
      const received = this.utils.printReceived(list);
      const expected = this.utils.printExpected(text);

      return {
        message: () =>
          `Expected ${expected} got ${received}
(using ${order_type} numbers)`,
        pass: false,
      };
    }
    return {
      message: () =>
        `${text} round-tripped unexpectedly
(using ${order_type} numbers)`,
      pass: true,
    };
  };

  const order = parse(text);
  if (order === null) {
    return {
      message: () => `'${text}' parsed to null`,
      pass: false,
    };
  }
  if (order?.length !== 1) {
    return {
      message: () =>
        `'${text}' parsed to more than one entry\n\n` +
        this.utils.printReceived(order),
      pass: false,
    };
  }

  const displayResults = checkUnparse(order, "DisplayNumber");
  const dbified = JSON.parse(JSON.stringify(order));
  const databaseResults = checkUnparse(dbified, "DatabaseNumber");
  if (this.isNot) {
    if (displayResults.pass) {
      return displayResults;
    }
    return databaseResults;
  } else {
    if (displayResults.pass) {
      return databaseResults;
    }
    return displayResults;
  }
}