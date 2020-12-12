const nearley = require("nearley");
const grammar = require("./grammar.js");
const fs = require("fs");
const lexer = require("./lexer.js");

const input = fs.readFileSync("examples/martha-stewart", "utf-8");

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
parser.feed(input);
const results = parser.results;
console.log(JSON.stringify(parser.results, null, "  "));
