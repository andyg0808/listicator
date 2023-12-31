import React from "react";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import Container from "@material-ui/core/Container";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";

import styled from "@emotion/styled";
import * as R from "ramda";

import { useDispatch } from "react-redux";

import { addRecipe } from "./recipes";
import { safeParse } from "./parser";
import { Order, Recipe, DisplayNumber, databaseNumberToString } from "./types";
import { Prosemirror } from "./Prosemirror";

export function Viewer({ ingredients }: { ingredients: Order[] }) {
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
  onUpdate: (recipe: Recipe) => void;
  defaultTitle: string;
  defaultText: string;
}

interface Blob {
  title: string;
  text: string;
}

export function Editor({
  onUpdate,
  defaultTitle,
  defaultText,
}: EditorInterface) {
  const [blob, setBlob] = React.useState<Blob>({
    title: defaultTitle,
    text: defaultText,
  });

  const ingredients = safeParse(blob.text);

  function titleUpdate(title: string): void {
    setBlob((blob) => {
      onUpdate({ title: blob.title, ingredients: safeParse(blob.text) });
      return R.assoc("title", title, blob);
    });
  }

  function textUpdate(text: string): void {
    setBlob((blob) => {
      onUpdate({ title: blob.title, ingredients: safeParse(text) });
      return R.assoc("text", text, blob);
    });
  }

  return (
    <Box display="flex" flexDirection="column">
      <TextField
        data-test="Title"
        onChange={(e: any) => titleUpdate(e.target.value)}
        onBlur={(e: any) => titleUpdate(e.target.value)}
        label="Title"
        value={blob.title}
      />
      <EditField onChange={textUpdate} value={defaultText} />
      <Viewer ingredients={ingredients} />
    </Box>
  );
}
