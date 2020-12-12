import { Recipe, Order, Amount } from "./types";
import nearley from "nearley";
import grammar from "./grammar";
import { log } from "./logger";

export function parse(data: string): Recipe {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(data);
  if (parser.results.length > 1) {
    throw new Error("Ambiguous parse");
  }
  const results = parser.results[0];
  // console.log(JSON.stringify(parser.results, null, "  "));
  // console.log("results", results);
  if (results.length == 0) {
    throw new Error("Invalid length");
  }

  const ingredients = results[0]
    .filter((i) => i !== null)
    .map(
      (ingredient_parse): Order => {
        // console.log("ingredient", ingredient_parse);
        log(ingredient_parse);
        const name = ingredient_parse[2].value;
        const ingredient = { name };
        const amount_parse = ingredient_parse[1];
        // console.log("amount", amount_parse);
        const quantity = amount_parse?.[0] || null;
        const unit = amount_parse?.[2]?.[0]?.value || null;
        const amount = { quantity, unit };
        return {
          ingredient,
          amount,
        };
      }
    );
  return {
    ingredients,
  };
}
