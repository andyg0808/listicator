import React from "react";
import Table from "@material-ui/core/Table";
import Container from "@material-ui/core/Container";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import { useDispatch } from "react-redux";

import { addRecipe } from "./recipes";
import { safeParse } from "./parser";
import { Order, Recipe } from "./types";

export function Viewer({ ingredients }) {
  return (
    <Table>
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
            <TableCell>{order.amount.quantity?.toPrecision(2)}</TableCell>
            <TableCell>{order.amount.unit}</TableCell>
            <TableCell>{order.ingredient.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export interface EditorInterface {
  onUpdate: (recipe: Recipe) => void;
  defaultTitle: string;
  defaultText: string;
}

export function Editor({ onUpdate, defaultTitle, defaultText }) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [text, setText] = React.useState(defaultText);

  const ingredients = safeParse(text);

  function titleUpdate(title) {
    setTitle(title);
    onUpdate({ title, ingredients, text });
  }

  function textUpdate(text) {
    setText(text);
    const ingredients = safeParse(text);
    onUpdate({ title, ingredients, text });
  }

  return (
    <div>
      <TextField
        onChange={(e) => titleUpdate(e.target.value)}
        onBlur={(e) => titleUpdate(e.target.value)}
        label="Title"
        value={title}
      />
      <TextareaAutosize
        onChange={(e) => textUpdate(e.target.value)}
        onBlur={(e) => textUpdate(e.target.value)}
        value={text}
      />
      <Viewer ingredients={ingredients} />
    </div>
  );
}
