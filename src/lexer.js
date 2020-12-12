const moo = require("moo");
const fracMapping = new Map([
  ["¼", 1 / 4],
  ["½", 1 / 2],
]);
const regexMapping = [
  ["cups?", "cup"],
  ["teaspoons?", "teaspoon"],
  ["tablespoons?", "tablespoon"],
  ["ounces?", "ounce"],
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

module.exports = moo.compile({
  number: { match: /[0-9]+/, value: (v) => Number(v) },
  fraction: { match: /[¼½]/, value: (v) => fracMapping.get(v) },
  slash: /[/]/,
  dash: /-/,
  heading: /[A-Za-z ]+:\n/,
  ws: { match: /\s+/, lineBreaks: true },
  unit: { match: unitsRegex, value: matchUnit },
  ingredient: { match: /.+\n?/, lineBreaks: true, value: (v) => v.trim() },
});

function* filterLexer() {
  console.log("start");
  for (const lex of lexer) {
    console.log(lex);
    if (lex.type === "ws") {
      continue;
    }
    yield lex;
  }
}

const filtered = filterLexer();

filtered.has = (name) => lexer.has(name);
filtered.save = () => lexer.save();
filtered.reset = (chunk, info) => lexer.reset(chunk, info);
filtered.formatError = (token) => lexer.formatError(token);
