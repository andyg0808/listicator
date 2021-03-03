import React from "react";
import Box from "@material-ui/core/Box";
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

import styled from "@emotion/styled";
import { useDispatch } from "react-redux";

import { addRecipe } from "./recipes";
import { safeParse } from "./parser";
import { Order, Recipe, DisplayNumber } from "./types";
import { Prosemirror } from "./Prosemirror";

export function Viewer({
  ingredients,
}: {
  ingredients: Order<DisplayNumber>[];
}) {
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
        {ingredients.map((order: Order<DisplayNumber>, i: number) => (
          <TableRow key={order.ingredient.name + i}>
            <TableCell>{order.amount.quantity?.toFraction()}</TableCell>
            <TableCell>{order.amount.unit}</TableCell>
            <TableCell>{order.ingredient.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const EditField = styled(Prosemirror)`
  min-height: 50vh;
`;

export interface EditorInterface {
  onUpdate: (recipe: Recipe<DisplayNumber>) => void;
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
    <Box display="flex" flexDirection="column">
      <TextField
        onChange={(e) => titleUpdate(e.target.value)}
        onBlur={(e) => titleUpdate(e.target.value)}
        label="Title"
        value={title}
      />
      <EditField onChange={textUpdate} value={text} />
      <Viewer ingredients={ingredients} />
    </Box>
  );
}
