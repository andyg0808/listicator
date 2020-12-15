const moo = require("moo");
const fracMapping = new Map([
  ["¼", 1 / 4],
  ["½", 1 / 2],
  ["⅓", 1 / 3],
]);
const regexMapping = [
  ["pints?", "pint"],
  ["cups?|c\\.", "cup"],
  ["teaspoons?|tsp\\.|tsp\\b", "teaspoon"],
  ["[tT]ablespoons?|tbsp\\.|tbsp\\b", "tablespoon"],
  ["pounds?|lb\\b", "pound"],
  ["ounces?|oz\\b", "ounce"],
  ["g\\b", "gram"],
  ["x\\b", "count"],
  ["ml\\b", "milliliter"],
  ["litres?", "liter"],
  ["handful", "handful"],
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

const unitsRegex = new RegExp(
  regexMapping.map(([regex, _]) => regex).join("|")
);
const matcherMapping = regexMapping.map(([regex, unit]) => [
  new RegExp("^" + regex + "$"),
  unit,
]);

function matchUnit(value) {
  for (const [regex, unit] of matcherMapping) {
    if (regex.test(value)) {
      return unit;
    }
  }
}

const fractionRegex = new RegExp(
  "[" + Array.from(fracMapping.keys()).join() + "]"
);

const universal = {
  ws: { match: /\s+/, lineBreaks: true },
};

const ounces = {
  ounces: { match: /\d+-(?:ounce|oz)|\(\d+-(?:ounce|oz)\)/, next: "unit" },
};

const unit = {
  unit: { match: unitsRegex, value: matchUnit, next: "ingredient" },
};

const ingredient = {
  ingredient: {
    match: /.+\n?/,
    lineBreaks: true,
    value: (v) => v.trim(),
    next: "main",
  },
};

const delimiterChar = "!";

const delimiter = (next) => {
  return {
    delimiter: { match: delimiterChar, next },
  };
};

module.exports = moo.states({
  main: {
    ...ounces,
    number: { match: /[0-9.]+/, value: (v) => Number(v) },
    fraction: { match: fractionRegex, value: (v) => fracMapping.get(v) },
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
    ...ounces,
    ...universal,
    ...unit,
    ...delimiter("ingredient"),
    forced_unit: {
      match: new RegExp(`[^${delimiterChar}]*${delimiterChar}`),
      value: (v) => v.substring(0, v.length - 1),
      next: "ingredient",
    },
  },
  ingredient: {
    ...universal,
    of: /\bof\b/,
    ...ingredient,
  },
});
