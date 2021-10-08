import { Recipe, Order, Amount, DatabaseNumber, StoredFraction } from "./types";
import nearley from "nearley";
import grammar from "./grammar";
import * as R from "ramda";
import Fraction from "fraction.js";

type IngredientParse = [DatabaseNumber, null | string, string];

export function parse(data: string): Array<Order> | null {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(data);
  if (parser.results.length > 1) {
    throw new Error("Ambiguous parse");
  }
  const results = parser.results[0];
  if (!results || results.length == 0) {
    return null;
  }

  const ingredients = results[0]
    .filter((i: any) => i !== null)
    .map((ingredient_parse: IngredientParse): Order => {
      const name = ingredient_parse[2];
      const ingredient = { name };
      const quantity = ingredient_parse[0];
      const unit = ingredient_parse[1];
      const amount = { quantity, unit };
      return {
        ingredient,
        amount,
      };
    });
  return ingredients;
}

export function safeParse(text: string): Order[] | null {
  try {
    return parse(text.trim());
  } catch (e) {
    return null;
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
  } catch (e: any) {
    const token = e.token;
    console.log("ERROR CAUGHT!", token);
    return token;
  }
}

function toQtyString(v: null | StoredFraction | number): string {
  if (v === null) {
    return "";
  }
  if (typeof v === "number") {
    return new Fraction(v).toFraction();
  }
  return new Fraction(v).toFraction();
}

export function unparse(data: Order[]): string {
  return data
    .map((order) => {
      const { amount, ingredient } = order;
      const { quantity, unit } = amount;
      const check = (render: string) => {
        try {
          return R.equals(parse(render + "\n")?.[0], order);
        } catch (e) {
          return false;
        }
      };

      const quantityStr = toQtyString(quantity);
      const unitStr = unit === null ? "" : unit;
      const ingredientStr = ingredient.name;

      let render = (
        unit
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
