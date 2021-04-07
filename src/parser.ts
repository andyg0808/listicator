import { Recipe, Order, Amount, DatabaseNumber } from "./types";
import nearley from "nearley";
import grammar from "./grammar";
import * as R from "ramda";

export function parse(data: string): Array<Order> {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(data);
  if (parser.results.length > 1) {
    throw new Error("Ambiguous parse");
  }
  const results = parser.results[0];
  if (!results || results.length == 0) {
    return [];
  }

  const ingredients = results[0]
    .filter((i) => i !== null)
    .map(
      (ingredient_parse): Order => {
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
    const lines = text.trim().split(/\n/);
    const line = e.token?.line || 0;
    return [];
  }
}

export interface ParseError {
  offset: number;
  lineBreaks: number;
  line: number;
  col: number;
}

export function errorParse(text: string): ParseError | null {
  try {
    console.log("parse result", parse(text.trim()));
    return null;
  } catch (e) {
    console.log("ERROR CAUGHT!", e.token);
    return e.token;
  }
}

export function unparse(data: Order[]): string {
  return data
    .map((order) => {
      const { amount, ingredient } = order;
      const { quantity, unit } = amount;
      const check = (render) => {
        try {
          return R.equals(parse(render)[0], order);
        } catch (e) {
          return false;
        }
      };

      const quantityStr = quantity === null ? "" : quantity;
      const unitStr = unit === null ? "" : unit;
      const ingredientStr = ingredient.name;

      let render = (unit
        ? `${quantityStr} ${unitStr} ${ingredientStr}`
        : `${quantityStr} ${ingredientStr}`
      ).trim();
      if (check(render)) {
        return render;
      }
      render = `${quantityStr}!${unitStr} ${ingredientStr}`;
      if (check(render)) {
        return render;
      }
      render = `${quantityStr} ${unitStr}!${ingredientStr}`;
      if (check(render)) {
        return render;
      }
      return `${quantityStr}!${unitStr}!${ingredientStr}`;
    })
    .join("\n");
}
