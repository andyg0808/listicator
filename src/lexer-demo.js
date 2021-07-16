const fs = require("fs");
const { lexer } = require("./lexer.js");

const input = fs.readFileSync("examples/allrecipes", "utf-8");

lexer.reset(input);
for (const token of lexer) {
  console.log(token);
}
