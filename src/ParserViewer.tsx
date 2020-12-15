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

import { parse } from "./parser";
import { Order } from "./types";

export default function ParserViewer() {
  const [text, setText] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState<boolean>(false);
  const recipe = parse(text.trim());
  function reset() {
    setText("");
    setUrl("");
    setErr(null);
    setSaved(false);
  }
  function sendToServer() {
    if (!url) {
      setErr("Missing url");
    }
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
    }).then((res) => {
      if (res.ok) {
        reset();
        setSaved(true);
      } else {
        setErr(text);
        setSaved(false);
      }
    });
  }

  return (
    <Container>
      {err && (
        <Alert elevation={6} variant="filled" severity="error">
          Error saving example: {err}
        </Alert>
      )}
      {!err && saved && (
        <Alert elevation={6} variant="filled" severity="success">
          Example saved.
        </Alert>
      )}
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
          {recipe.ingredients.map((order: Order, i: number) => (
            <TableRow key={order.ingredient.name + i}>
              <TableCell>{order.amount.quantity}</TableCell>
              <TableCell>{order.amount.unit}</TableCell>
              <TableCell>{order.ingredient.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={sendToServer}>Save</Button>
      <Button onClick={reset}>Reset</Button>
    </Container>
  );
}