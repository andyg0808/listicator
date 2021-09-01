/** @jsxImportSource @emotion/react */
import * as React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import {
  Recipe,
  Order,
  getDescription,
  totalOrderFromOrder,
  Unit,
  databaseNumberMult,
  IngredientId,
  Conversion,
  Density,
} from "./types";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Fraction from "fraction.js";

type ConversionTable = Array<Conversion | Density>;

const ConversionTable: Array<Conversion> = [
  { from: "tablespoon", to: "teaspoon", value: new Fraction(3) },
  { from: "cup", to: "tablespoon", value: new Fraction(4 * 4) },
  { from: "tablespoon", to: "fluid ounce", value: new Fraction(1, 2) },
  {
    from: "fluid ounce",
    to: "milliliter",
    value: new Fraction(30),
  },
];

export function ConversionTab() {
  const recipes = useSelector((state: RootState) => state.recipes.present);
  const densities = useSelector((state: RootState) => state.conversionTable);
  const [recipeId, setRecipe] = React.useState(recipes[0].title);
  const recipe = recipes.find((r) => r.title === recipeId);
  const target = "gram";
  const conversionTable = ConversionTable.concat(densities);
  const converted = recipe && {
    ...recipe,
    ingredients: recipe.ingredients.map((order) =>
      convertOrder(order, target, conversionTable)
    ),
  };
  return (
    <div css={{ maxWidth: "500px", margin: "auto", paddingTop: "30px" }}>
      <FormControl css={{ width: "100%" }}>
        <InputLabel>Recipe</InputLabel>
        <Select
          value={recipe?.title}
          onChange={(e) => setRecipe(e.target.value as string)}
        >
          {recipes.map((recipe: Recipe, index: number) => (
            <MenuItem value={recipe.title}>{recipe.title}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {converted && (
        <div>
          <h2>{converted.title}</h2>
          <div>
            {converted.ingredients.map((order: Order) => (
              <div>
                <div>{getDescription(totalOrderFromOrder(order))}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function convertOrder(
  order: Order,
  target: Unit,
  conversionTable: ConversionTable
): Order {
  // No conversion possible if there aren't units
  if (order.amount.unit === null) {
    return order;
  }

  const quantity = databaseNumberMult(
    order.amount.quantity,
    shortestPath(
      order.amount.unit,
      target,
      order.ingredient.name,
      conversionTable
    )
  );

  // We couldn't find a conversion; return the original units
  if (quantity === null) {
    return order;
  }

  return {
    ...order,
    amount: {
      quantity,
      unit: target,
    },
  };
}

function addInversions(conversionTable: ConversionTable): ConversionTable {
  return conversionTable
    .map((c: Conversion) => {
      return {
        from: c.to,
        to: c.from,
        value: c.value.inverse(),
      };
    })
    .concat(conversionTable);
}

function shortestPath(
  unit: string,
  target: string,
  ingredient: IngredientId,
  conversionTable: ConversionTable
): Fraction | null {
  /** @param {Set<string>} seen A (mutable) set of conversions we've tried. */
  function _shortestPath(unit: string, seen: Set<string>): Fraction | null {
    seen.add(unit);
    const found = addInversions(conversionTable).filter(
      (c: Conversion | Density) =>
        c.from === unit && (!("ingredient" in c) || c.ingredient === ingredient)
    );
    for (const conversion of found) {
      if (conversion.to === target) {
        console.log(conversion.to);
        return conversion.value;
      }
      if (seen.has(conversion.to)) {
        continue;
      }
      const match = _shortestPath(conversion.to, seen);
      if (match !== null) {
        console.log(conversion.to);
        return conversion.value.mul(match);
      }
    }
    // No match could be found. Give up.
    return null;
  }
  return _shortestPath(unit, new Set());
}
