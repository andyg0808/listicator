const moo = require("moo");
const fracMapping = new Map([
  ["¼", 1 / 4],
  ["½", 1 / 2],
]);
const regexMapping = [
  ["cups?|c\\.", "cup"],
  ["teaspoons?|tsp\\.", "teaspoon"],
  ["[tT]ablespoons?|tbsp\\.", "tablespoon"],
  ["ounces?", "ounce"],
  ["g", "gram"],
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

module.exports = moo.compile({
  number: { match: /[0-9]+/, value: (v) => Number(v) },
  fraction: { match: fractionRegex, value: (v) => fracMapping.get(v) },
  slash: /[/⁄]/,
  dash: /-/,
  heading: /[A-Za-z ]+:\n/,
  ws: { match: /\s+/, lineBreaks: true },
  unit: { match: unitsRegex, value: matchUnit },
  ingredient: { match: /.+\n?/, lineBreaks: true, value: (v) => v.trim() },
});
