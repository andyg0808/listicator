import { lexer } from "./lexer";
import { zip } from "ramda";
import Fraction from "fraction.js";

expect.extend({
  toLexAs(text, expected) {
    const options = {
      comment: "Deep equality",
      isNot: this.isNot,
      promise: this.promise,
    };

    lexer.reset(text);
    const actual = Array.from(lexer);
    for (let pair of zip(expected, actual)) {
      const [expected, actual] = pair;
      const pass = this.equals(actual.value, expected);
      if (pass) {
        if (this.isNot) {
          return {
            message: () =>
              this.utils.matcherHint("toLexAs", undefined, undefined, options) +
              "\n\n" +
              `Expected: not ${this.utils.printExpected(expected)}\n` +
              `Received: ${this.utils.printReceived(actual)}`,
            pass,
          };
        } else {
          continue;
        }
      } else {
        const diffString = this.utils.diff(expected, actual, {
          expand: this.expand,
        });
        const printExpect = this.utils.printExpected(expected);
        const printReceived = this.utils.printReceived(actual.value);
        const fullObject = this.utils.stringify(actual);
        return {
          message: () =>
            this.utils.matcherHint("toLexAs", undefined, undefined, options) +
            "\n\n" +
            `Expected: ${printExpect}\n` +
            `Received: ${printReceived}\n\n` +
            `Full object:\n${fullObject}`,
          pass,
        };
      }
    }
    return {
      message: () =>
        this.utils.matcherHint("toLexAs", undefined, undefined, options),
      pass: true,
    };
  },
});

test("Basic lexing", () => {
  expect("1 gal. ketchup").toLexAs([
    new Fraction(1),
    " ",
    "gallon",
    " ",
    "ketchup",
  ]);

  expect("1/2 lb. sugar").toLexAs([
    new Fraction(1),
    "/",
    new Fraction(2),
    " ",
    "pound",
    " ",
    "sugar",
  ]);

  expect("1 sprig oak leaves").toLexAs([
    new Fraction(1),
    " ",
    "sprig",
    " ",
    "oak leaves",
  ]);
});
