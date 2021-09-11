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
  databaseNumberToDisplayNumber,
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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
//import TextField from "@material-ui/core/TextField";
import { TextField, Select as FormikSelect } from "formik-material-ui";
import Fraction from "fraction.js";
import { setConversion, deleteConversion } from "./conversion_table";
import { Formik, Field } from "formik";
import { units as lexerUnitTable } from "./lexer";
import * as yup from "yup";
import * as R from "ramda";
import { initialValueFromCurrent } from "./ConversionTools.gen";

type ConversionTable = Array<Conversion | Density>;

const ConversionTable: Array<Conversion> = [
  { from: "tablespoon", to: "teaspoon", value: new Fraction(3) },
  { from: "cup", to: "tablespoon", value: new Fraction(4 * 4) },
  { from: "pint", to: "cup", value: new Fraction(2) },
  { from: "tablespoon", to: "fluid ounce", value: new Fraction(1, 2) },
  {
    from: "fluid ounce",
    to: "milliliter",
    value: new Fraction(30),
  },
  {
    from: "ounce",
    to: "gram",
    value: new Fraction(28.349),
  },
  {
    from: "pound",
    to: "ounce",
    value: new Fraction(16),
  },
];

export function ConversionTab() {
  const recipes = useSelector((state: RootState) => state.recipes.present);
  const densities = useSelector((state: RootState) => state.conversionTable);
  const [recipeId, setRecipe] = React.useState(recipes[0].title);
  const [showConversions, setShowConversions] = React.useState(false);
  const recipe = recipes.find((r) => r.title === recipeId);
  const [target, setTarget] = React.useState("gram");
  const [convert, setConvert] = React.useState(true);
  const conversionTable = ConversionTable.concat(densities);
  const dispatch = useDispatch();
  const units = useUnits();
  return (
    <div css={{ maxWidth: "500px", margin: "auto", paddingTop: "30px" }}>
      <div css={{ width: "100%", display: "flex", flexDirection: "column" }}>
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
          <InputLabel>Target Unit</InputLabel>
          <Select
            value={target}
            onChange={(e) => setTarget(e.target.value as string)}
          >
            {units.map((unit: Unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}s
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={showConversions}
              onChange={(e) => setShowConversions(e.target.checked)}
            />
          }
          label="Show unit conversion entries"
        />
        <FormControlLabel
          control={
            <Switch
              checked={!convert}
              onChange={(e) => setConvert(!e.target.checked)}
            />
          }
          label="Show original units"
        />
      </div>
      {recipe && (
        <div>
          <Typography variant="h2">{recipe.title}</Typography>
          <List>
            {recipe.ingredients.map((order: Order, i: number) => {
              const converted = convertOrder(order, target, conversionTable);
              const o = convert ? converted : order;
              // We can't guarantee that there's not duplicate
              // ingredients, so we don't have a good key value
              // available. In the future it may be worth the
              // computation to generate a unique key for each
              // ingredient name
              return (
                <ListItem
                  css={
                    showConversions
                      ? { paddingTop: "2em", paddingBottom: "2em" }
                      : {}
                  }
                >
                  <ListItemIcon>
                    <Checkbox edge="start" />
                  </ListItemIcon>
                  <div
                    css={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <Typography variant="h5" component="h3">
                      {getDescription(totalOrderFromOrder(o))}
                    </Typography>
                    {showConversions && (
                      <ConversionValue order={order} target={target} />
                    )}
                  </div>
                </ListItem>
              );
            })}
          </List>
        </div>
      )}
    </div>
  );
}

interface ConversionValueProps {
  target: Unit;
  order: Order;
}

function useUnits(): Array<Unit> {
  const recipes = useSelector((state: RootState) => state.recipes.present);
  const recipeUnits = recipes.flatMap((r: Recipe) =>
    r.ingredients
      .map((o: Order) => o.amount.unit)
      .filter((u: string | null): u is string => u !== null)
  );
  const lexerUnits = lexerUnitTable.map((a: [string, string]) => a[1]);
  return R.uniq(recipeUnits.concat(lexerUnits));
}

function ConversionValue({ target, order }: ConversionValueProps) {
  const units = useUnits();
  const densities = useSelector((state: RootState) => state.conversionTable);
  const conversionTable = ConversionTable.concat(densities);
  const dispatch = useDispatch();
  const source = order.amount.unit;
  const qty = databaseNumberToDisplayNumber(order.amount.quantity);

  const factor =
    source === null
      ? null
      : shortestPath(source, target, order.ingredient.name, conversionTable);

  if (source === null) {
    return null;
  }
  if (qty === null) {
    return null;
  }

  const currentDensity = densities.find(
    (d: Density) => d.ingredient === order.ingredient.name
  );

  const initialValue = initialValueFromCurrent(
    currentDensity,
    qty.valueOf(),
    source,
    target
  );
  const fromId = String(Math.random());
  const toId = String(Math.random());
  return (
    <Formik
      initialValues={initialValue}
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
        <div
          css={{
            display: "flex",
            paddingTop: "0.5em",
            //borderBottom: "1px solid black",
          }}
        >
          <Field
            component={TextField}
            name="from"
            label="From"
            css={{ width: "5em" }}
            onBlur={() => submitForm()}
          />
          <div>
            <InputLabel shrink id={fromId}>
              Unit
            </InputLabel>
            <Field
              component={FormikSelect}
              labelId={fromId}
              name="from_unit"
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
          </div>
          <Typography
            variant="body2"
            css={{ textAlign: "center", flexGrow: 1, alignSelf: "flex-end" }}
          >
            of {order.ingredient.name} is
          </Typography>
          <Field
            component={TextField}
            name="to"
            label="To"
            css={{ width: "5em" }}
            onBlur={() => submitForm()}
          />
          <div>
            <InputLabel shrink id={toId}>
              Unit
            </InputLabel>
            <Field
              component={FormikSelect}
              name="to_unit"
              labelId={toId}
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
          </div>
        </div>
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
