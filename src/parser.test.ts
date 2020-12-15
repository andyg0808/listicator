import { parse } from "./parser";
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
}

const examples = Array.from(getTestData()); //.slice(0, 9);

test.each(examples)("parse %s", (name: string, example: ExamplePair) => {
  expect(parse(example.input.trim())).toEqual(example.expected);
});
