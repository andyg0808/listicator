import { Recipe, Order, Amount } from "./types";
import nearley from "nearley";
import grammar from "./grammar";
import { log } from "./logger";

export function parse(data: string): Array<Order> {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(data);
  if (parser.results.length > 1) {
    throw new Error("Ambiguous parse");
  }
  const results = parser.results[0];
  // console.log(JSON.stringify(parser.results, null, "  "));
  // console.log("results", results);
  if (!results || results.length == 0) {
    return [];
  }

  log("results", results);

  const ingredients = results[0]
    .filter((i) => i !== null)
    .map(
      (ingredient_parse): Order => {
        // console.log("ingredient", ingredient_parse);
        log("ingredient", ingredient_parse);
        const name = ingredient_parse[2];
        const ingredient = { name };
        const quantity = ingredient_parse[0];
        const unit = ingredient_parse[1];
        const amount = { quantity, unit };
        return {
          ingredient,
          amount,
        };
      }
    );
  return ingredients;
}

export function safeParse(text: string): Order[] {
  try {
    return parse(text.trim());
  } catch (e) {
    console.log(e);
    console.log(JSON.stringify(e, null, "  "));
    const lines = text.trim().split(/\n/);
    const line = e.token?.line || 0;
    console.log(line, lines.length);
    console.log(lines.slice(line - 1, line + 2));
    return [];
  }
}
