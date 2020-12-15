const moo = require("moo");
const fracMapping = new Map([
  ["¼", 1 / 4],
  ["½", 1 / 2],
]);
const regexMapping = [
  ["cups?|c\\.", "cup"],
  ["teaspoons?|tsp\\.|tsp\\b", "teaspoon"],
  ["[tT]ablespoons?|tbsp\\.|tbsp\\b", "tablespoon"],
  ["ounces?", "ounce"],
  ["g\\b", "gram"],
  ["x\\b", "count"],
  ["ml\\b", "milliliter"],
  ["litres?", "liter"],
  ["handful", "handful"],
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

module.exports = moo.states({
  main: {
    number: { match: /[0-9.]+/, value: (v) => Number(v) },
    fraction: { match: fractionRegex, value: (v) => fracMapping.get(v) },
    slash: /[/⁄]/,
    dash: /-/,
    heading: /[A-Za-z ]+:\n/,
    ...universal,
    ...unit,
    ...ingredient,
  },
  unit: {
    ...universal,
    ...unit,
  },
  ingredient: {
    ...universal,
    of: /\bof\b/,
    ...ingredient,
  },
});
