/** @jsxImportSource @emotion/react */
import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
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
  StoredFraction,
} from "./types";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
//import TextField from "@material-ui/core/TextField";
import { TextField } from "formik-material-ui";
import Fraction from "fraction.js";
import { setConversion, deleteConversion } from "./conversion_table";
import { Form, Formik, Field } from "formik";
import * as yup from "yup";

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
  const dispatch = useDispatch();
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
      {recipe && (
        <div>
          <h2>{recipe.title}</h2>
          <div>
            {recipe.ingredients.map((order: Order) => {
              const converted = convertOrder(order, target, conversionTable);
              return (
                <div>
                  <div>{getDescription(totalOrderFromOrder(converted))}</div>
                  <ConversionValue order={order} target={target} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ConversionValueProps {
  target: Unit;
  order: Order;
}

function ConversionValue({ target, order }: ConversionValueProps) {
  const recipes = useSelector((state: RootState) => state.recipes.present);
  const densities = useSelector((state: RootState) => state.conversionTable);
  const conversionTable = ConversionTable.concat(densities);
  const dispatch = useDispatch();
  const source = order.amount.unit;

  const factor =
    source === null
      ? null
      : shortestPath(source, target, order.ingredient.name, conversionTable);

  if (source === null) {
    return null;
  }

  function updateConversion(value: string) {
    if (value === "") {
      dispatch(
        deleteConversion({
          from: source || "",
          to: target,
          ingredient: order.ingredient.name,
        })
      );
      return;
    }

    dispatch(
      setConversion({
        from: source || "",
        to: target,
        ingredient: order.ingredient.name,
        value: new Fraction(value),
      })
    );
  }
  return (
    <Formik
      initialValues={{ from: factor?.d || "", to: factor?.n || "" }}
      onSubmit={(values) => {
        console.log("submit handler", values);
      }}
      validate={(values) => {
        console.log("validator", values);
        return {};
      }}
      validationSchema={yup
        .object()
        .shape({ from: yup.number().required(), to: yup.number().required() })}
    >
      {({ submitForm, isSubmitting }) => (
        <>
          Conversion: From
          <Field component={TextField} name="from" label={order.amount.unit} />
          To <Field component={TextField} name="to" label={target} />
        </>
      )}
    </Formik>
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
        value: new Fraction(c.value).inverse() as StoredFraction,
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
        return new Fraction(conversion.value);
      }
      if (seen.has(conversion.to)) {
        continue;
      }
      const match = _shortestPath(conversion.to, seen);
      if (match !== null) {
        return new Fraction(conversion.value).mul(match);
      }
    }
    // No match could be found. Give up.
    return null;
  }
  return _shortestPath(unit, new Set());
}
