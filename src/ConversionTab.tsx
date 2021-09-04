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
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
//import TextField from "@material-ui/core/TextField";
import { TextField, Select as FormikSelect } from "formik-material-ui";
import Fraction from "fraction.js";
import { setConversion, deleteConversion } from "./conversion_table";
import { Formik, Field } from "formik";
import { units as lexerUnitTable } from "./lexer";
import * as yup from "yup";
import * as R from "ramda";

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
  const [showConversions, setShowConversions] = React.useState(true);
  const recipe = recipes.find((r) => r.title === recipeId);
  const target = "gram";
  const conversionTable = ConversionTable.concat(densities);
  const dispatch = useDispatch();
  return (
    <div css={{ maxWidth: "500px", margin: "auto", paddingTop: "30px" }}>
      <div css={{ width: "100%", display: "flex" }}>
        <FormControl>
          <InputLabel>Recipe</InputLabel>
          <Select
            value={recipe?.title}
            onChange={(e) => setRecipe(e.target.value as string)}
          >
            {recipes.map((recipe: Recipe, index: number) => (
              <MenuItem key={recipe.title} value={recipe.title}>
                {recipe.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Show unit conversion entries</InputLabel>
          <Switch
            value={showConversions}
            onChange={(e) => setShowConversions(e.target.checked)}
          />
        </FormControl>
      </div>
      {recipe && (
        <div>
          <h2>{recipe.title}</h2>
          <div>
            {recipe.ingredients.map((order: Order, i: number) => {
              const converted = convertOrder(order, target, conversionTable);
              // We can't guarantee that there's not duplicate
              // ingredients, so we don't have a good key value
              // available. In the future it may be worth the
              // computation to generate a unique key for each
              // ingredient name
              return (
                <div>
                  <div>{getDescription(totalOrderFromOrder(converted))}</div>
                  {showConversions && (
                    <ConversionValue order={order} target={target} />
                  )}
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
  const recipeUnits = recipes.flatMap((r: Recipe) =>
    r.ingredients
      .map((o: Order) => o.amount.unit)
      .filter((u: string | null): u is string => u !== null)
  );
  const lexerUnits = lexerUnitTable.map((a: [string, string]) => a[1]);
  const units = R.uniq(recipeUnits.concat(lexerUnits));
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

  const currentDensity = densities.find(
    (d: Density) => d.ingredient === order.ingredient.name
  );

  // initial values aren't safe, because they could mismatch the from/to/from_unit/to_unit
  // We need to choose the correct initial value object based on heuristic
  return (
    <Formik
      initialValues={{
        from: factor?.d || "",
        to: factor?.n || "",
        from_unit: currentDensity?.from || source,
        to_unit: currentDensity?.to || target || "",
      }}
      onSubmit={(values, { setSubmitting }) => {
        if (values.from === "" || values.to === "") {
          dispatch(deleteConversion(order.ingredient.name));
        } else {
          const value = new Fraction(Number(values.to), Number(values.from));
          dispatch(
            setConversion({
              from: values.from_unit,
              to: values.to_unit,
              ingredient: order.ingredient.name,
              value,
            })
          );
        }
        setSubmitting(false);
      }}
      validationSchema={yup.object().shape({
        from: yup.number(),
        to: yup.number(),
        from_unit: yup.string().required(),
        to_unit: yup.string().required(),
      })}
    >
      {({ submitForm, isSubmitting }) => (
        <>
          Conversion:
          <Field
            component={TextField}
            name="from"
            label="From"
            onBlur={() => submitForm()}
          />
          <Field
            component={FormikSelect}
            name="from_unit"
            label="Unit to convert from"
            onBlur={() => submitForm()}
          >
            {units.map((unit) => {
              return (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              );
            })}
          </Field>
          <Field
            component={TextField}
            name="to"
            label="To"
            onBlur={() => submitForm()}
          />
          <Field
            component={FormikSelect}
            name="to_unit"
            label="Unit to convert to"
            onBlur={() => submitForm()}
          >
            {units.map((unit) => {
              return (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              );
            })}
          </Field>
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

/** Find conversion from `unit` to `target`. Uses the provided
conversion table and only selects units which are not specific to an
ingredient or those which specify `ingredient`. This is used to allow
density-based conversions to be specified (primarily volume units to
grams). */
function shortestPath(
  unit: string,
  target: string,
  ingredient: IngredientId,
  conversionTable: ConversionTable
): Fraction | null {
  /*
   * Graph-based technique inspired by technique from T. Wildi, Metric
   * Units and Conversion Charts: A Metrication Handbook for Engineers,
   * Technologists, and Scientists, 2nd ed., Piscataway, NJ: IEEE Press,
   * 1995. as described in G. S. Novak, "Conversion of units of
   * measurement," in IEEE Transactions on Software Engineering,
   * vol. 21, no. 8, pp. 651-661, Aug. 1995, doi:
   * 10.1109/32.403789. (https://www.cs.utexas.edu/users/novak/units95.html)
   */

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
