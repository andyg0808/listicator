import fc from "fast-check";

import { parse } from "./parser";
import { matchUnit, unitsRegex } from "./lexer";
import { Recipe, Order, Amount, Ingredient } from "./types";

import fs from "fs";

interface ExamplePair {
  name: String;
  expected: Recipe;
  input: String;
}

function parseExpected(blob: string, src: string): Recipe {
  const items = blob.split("\n").map((line) => {
    const parts = line.split("|");
    if (parts.length < 3) {
      return null;
    }
    const [amount_str, unit_str, ingredient_str] = parts;
    const amount: Amount = {
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
  return {
    ingredients: items.filter((i: Order | null): i is Order => i !== null),
  };
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
const fc_unit = fc
  .string({ minLength: 1 })
  .map((s) => s.trim())
  .filter((s) => !s.includes("!") && s.length > 0 && !unitsRegex.test(s));
const fc_quantity = fc.nat().map((n) => (n === 0 ? "" : n));
const fc_amount = fc.record({
  quantity: fc_quantity,
  unit: fc_unit,
});
const fc_ingredient_name = fc
  .string({ minLength: 2 })
  .map((s) => s.trim())
  .filter((s) => !s.includes("!") && s.length > 1);
const fc_ingredient = fc.record({
  name: fc_ingredient_name,
});
const fc_recipe = fc.record({
  amount: fc_amount,
  ingredient: fc_ingredient,
});

test("Delimiter should disambiguate parses", () => {
  fc.assert(
    fc.property(
      fc_quantity,
      fc_unit,
      fc_ingredient_name,
      (quantity, unit, ingredient) => {
        const combined = `${quantity}!${unit}!${ingredient}\n`;
        const unified_quantity =
          quantity === "" && unit !== null ? 1 : quantity;
        const expected: Recipe = {
          ingredients: [
            {
              amount: {
                quantity: unified_quantity,
                unit: unit === "" ? null : matchUnit(unit),
              },
              ingredient: {
                name: ingredient,
              },
            },
          ],
        };
        expect(parse(combined)).toEqual(expected);
      }
    )
  );
});
