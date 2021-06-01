import moo from "moo";
import Fraction from "fraction.js";
import { StoredFraction } from "./types";
const fracMapping: Map<string, StoredFraction> = new Map([
  ["¼", { n: 1, d: 4 }],
  ["½", { n: 1, d: 2 }],
  ["⅓", { n: 1, d: 3 }],
  ["⅔", { n: 2, d: 3 }],
]);
const regexMapping = [
  ["pints?", "pint"],
  ["cups?|c\\.", "cup"],
  ["gallons?|gal\\.", "gallon"],
  ["teaspoons?|tsp\\.|tsp\\b", "teaspoon"],
  ["[tT]ablespoons?|[tT]bsp\\.|[tT]bsp\\b", "tablespoon"],
  ["pounds?|lb\\.|lb\\b", "pound"],
  ["ounces?|oz\\.|oz\\b", "ounce"],
  ["sprigs?", "sprig"],
  ["grams?|g\\b", "gram"],
  ["x\\b", "count"],
  ["ml\\b", "milliliter"],
  ["litres?", "liter"],
  ["handful", "handful"],
  ["pinch", "pinch"],
  ["sprigs?", "sprig"],
  ["bunch\\b", "bunch"],
  ["ears?\\b", "ear"],
  ["heads?\\b", "head"],
  ["cloves?\\b", "clove"],
  ["links?", "link"],
  ["cans?", "can"],
  ["tins?\\b", "tin"],
  ["jar", "jar"],
  ["chunk", "chunk"],
];

export const unitsRegex = new RegExp(
  regexMapping.map(([regex, _]) => regex).join("|")
);
const matcherMapping: [RegExp, string][] = regexMapping.map(([regex, unit]) => [
  new RegExp("^" + regex + "$"),
  unit,
]);

export function matchUnit(value: string) {
  for (const [regex, unit] of matcherMapping) {
    if (regex.test(value)) {
      return unit;
    }
  }
  return value;
}

const fractionRegex = new RegExp(
  "[" + Array.from(fracMapping.keys()).join() + "]"
);

const universal = {
  ws: { match: /\s+/, lineBreaks: true },
  lexError: moo.error,
};

const size = {
  size: {
    match: /\d+-(?:ounce|oz)|\(\d+-(?:ounce|oz)\)|\d+-(?:pound|lb\.?)/,
    next: "unit",
  },
};

const unit = {
  unit: { match: unitsRegex, value: matchUnit, next: "ingredient" },
};

const ingredient = {
  ingredient: {
    match: /.+\n?/,
    lineBreaks: true,
    value: (v: string) => v.trim(),
    next: "main",
  },
};

const delimiterChar = "!";

const delimiter = (next: string) => {
  return {
    delimiter: { match: delimiterChar, next },
  };
};

function mapFrac(v: string) {
  const mappedValue = fracMapping.get(v);
  return mappedValue ? new Fraction(mappedValue) : null;
}

export const lexer = moo.states({
  main: {
    ...size,
    number: { match: /[0-9.]+/, value: (v: string) => new Fraction(v) } as any,
    fraction: {
      match: fractionRegex,
      value: mapFrac,
    } as any,
    slash: /[/⁄]/,
    dash: /-/,
    to: /\bto\b/,
    ...delimiter("unit"),
    heading: /[A-Za-z ]+:\n/,
    ...universal,
    ...unit,
    ...ingredient,
  },
  unit: {
    ...size,
    ...universal,
    ...unit,
    ...delimiter("ingredient"),
    forced_unit: {
      match: new RegExp(`[^${delimiterChar}]*${delimiterChar}`),
      value: (v: string) => v.substring(0, v.length - 1),
      next: "ingredient",
    },
  },
  ingredient: {
    ...delimiter("ingredient"), // ignore leading delimiters
    ...universal,
    of: /\bof\b/,
    ...ingredient,
  },
});
