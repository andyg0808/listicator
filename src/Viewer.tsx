import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { Order, databaseNumberToString, Recipe } from "./types";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector } from "react-redux";
import { RootState } from "./store";

interface ViewerProps {
  ingredients: Order[];
  onUpdate: (current: Order, updated: string) => void;
}
export function Viewer({ ingredients, onUpdate }: ViewerProps) {
  return (
    <Table data-test="Viewer">
      <TableHead>
        <TableRow>
          <TableCell>Amount</TableCell>
          <TableCell>Unit</TableCell>
          <TableCell>Ingredient</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ingredients.map((order: Order, i: number) => (
          <TableRow key={order.ingredient.name + i}>
            <TableCell>
              {databaseNumberToString(order.amount.quantity)}
            </TableCell>
            <TableCell>{order.amount.unit}</TableCell>
            <TableCell>
              <IngredientChooser
                setIngredient={(value: string) => onUpdate(order, value)}
                current={order.ingredient.name}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface IngredientChooserProps {
  current: string;
  setIngredient: (name: string) => void;
}

function IngredientChooser({ current, setIngredient }: IngredientChooserProps) {
  const recipes = useSelector((store: RootState) => store.recipes.present);
  const orders = recipes.flatMap((recipe: Recipe) => recipe.ingredients);
  const options = orders.map((order: Order) => order.ingredient.name);
  return (
    <Select
      onChange={(e) => setIngredient(String(e.target.value))}
      value={current}
    >
      {options.map((option) => (
        <MenuItem value={option}>{option}</MenuItem>
      ))}
    </Select>
  );
}
