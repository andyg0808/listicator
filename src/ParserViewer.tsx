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

import { parse } from "./parser";
import { Order } from "./types";

export default function ParserViewer() {
  const [text, setText] = React.useState("");
  const [url, setUrl] = React.useState("");
  const recipe = parse(text);
  function sendToServer() {
    fetch("http://localhost:5000/example", {
      method: "PUT",
      body: JSON.stringify({
        url: url,
        example: text,
        expected: recipe.ingredients
          .map(
            (i) =>
              `${i.amount.quantity ?? ""}|${i.amount.unit ?? ""}|${
                i.ingredient.name ?? ""
              }`
          )
          .join("\n"),
      }),
      headers: { "Content-Type": "application/json;charset=UTF-8" },
    });
  }

  return (
    <Container>
      <TextareaAutosize onChange={(e) => setText(e.target.value)} />
      <TextField onChange={(e) => setUrl(e.target.value)} label="Url" />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Ingredient</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recipe.ingredients.map((order: Order) => (
            <TableRow>
              <TableCell>{order.amount.quantity}</TableCell>
              <TableCell>{order.amount.unit}</TableCell>
              <TableCell>{order.ingredient.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={sendToServer}>Save</Button>
    </Container>
  );
}
