import fc from "fast-check";

import { parse } from "./parser";
import { Recipe, Order, Amount, Ingredient, DatabaseNumber } from "./types";
import { fc_ingredient_name, fc_unit } from "./test_generators";
import Fraction from "fraction.js";
import { units } from "./lexer";
import { toParseAs } from "./jest_extensions";

import fs from "fs";

expect.extend({
  toParseAs,
});

interface ExamplePair {
  name: String;
  expected: Order[];
  input: String;
}

function parseExpected(blob: string, src: string): Order[] {
  const items = blob.split("\n").map((line) => {
    const parts = line.split("|");
    if (parts.length < 3) {
      return null;
    }
    const [amount_str, unit_str, ingredient_str] = parts;
    const amount: Amount<DatabaseNumber> = {
      quantity: amount_str ? new Fraction(amount_str) : null,
      unit: unit_str || null,
    };
    return {
      amount: amount,
      ingredient: {
        name: ingredient_str,
      },
    };
  });
  return items.filter((i: Order | null): i is Order => i !== null);
}

function* getTestData(): Generator<[string, ExamplePair]> {
  const examples_dir = fs.opendirSync("examples");
  let example;
  while ((example = examples_dir.readSync())) {
    const input = fs.readFileSync("examples/" + example.name, "utf-8");
    const expected = fs.readFileSync(
      "expected/" + example.name + "-expected",
      "utf-8"
    );
    yield [
      example.name,
      {
        name: example.name,
        expected: parseExpected(expected, example.name),
        input,
      },
    ];
  }
  examples_dir.close();
}

const examples = Array.from(getTestData());

test.each(examples)("parse %s", (name: string, example: ExamplePair) => {
  expect(parse(example.input.trim())).toEqual(example.expected);
});
const fc_quantity = fc.nat().map((n) => (n === 0 ? "" : n));
test("Delimiter should disambiguate parses", () => {
  fc.assert(
    fc.property(
      fc_quantity,
      fc_unit,
      fc_ingredient_name,
      (quantity, unit, ingredient) => {
        const combined = `${quantity}!${unit}!${ingredient}\n`;
        const unified_quantity =
          quantity === "" && unit !== null
            ? new Fraction(1)
            : new Fraction(quantity);
        const expected: Order[] = [
          {
            amount: {
              quantity: unified_quantity,
              unit: unit === "" ? null : unit,
            },
            ingredient: {
              name: ingredient,
            },
          },
        ];
        expect(parse(combined)).toEqual(expected);
      }
    )
  );
});

// Mapping from unit to expected name
const unitList = [
  ["tsp", "teaspoon"],
  ["tbsp", "tablespoon"],
  ["cups", "cup"],
  ["litre", "liter"],
].concat(units.map((u) => [u[1], u[1]]));
test.each(unitList)(
  "%s is a valid unit",
  (unit: string, expected_unit: string) => {
    fc.assert(
      fc.property(
        fc.nat().filter((n) => n > 0),
        (count) => {
          const ingredient = "blueberries";
          const line = `${count} ${unit} ${ingredient}`;
          const expected = [
            {
              amount: {
                quantity: new Fraction(count),
                unit: expected_unit,
              },
              ingredient: {
                name: ingredient,
              },
            },
          ];
          expect(line).toParseAs(expected);
        }
      )
    );
  }
);
