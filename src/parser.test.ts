import fc from "fast-check";

import { parse } from "./parser";
import { Recipe, Order, Amount, Ingredient, DatabaseNumber } from "./types";
import { fc_ingredient_name, fc_unit } from "./test_generators";

import fs from "fs";

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
      quantity: Number(amount_str) || null,
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
          quantity === "" && unit !== null ? 1 : (quantity as number);
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
