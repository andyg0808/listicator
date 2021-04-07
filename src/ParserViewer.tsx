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
import { Order, Recipe, databaseNumberToString } from "./types";

export default function ParserViewer() {
  const [text, setText] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState<boolean>(false);
  const dispatch = useDispatch();
  // console.log("Parsing");
  const ingredients = safeParse(text);
  // console.log("done");

  function reset() {
    setText("");
    setTitle("");
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
        expected: ingredients
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

  function saveToStore() {
    const recipe = {
      ingredients,
      title,
    };
    dispatch(addRecipe(recipe));
  }

  function saveToLocalStorage() {
    // console.log("stored", text);
    window.localStorage.setItem("listicator", JSON.stringify([title, text]));
  }
  function loadFromLocalStorage() {
    const [title, text] = JSON.parse(
      window.localStorage.getItem("listicator") || ""
    );
    setText(text);
    setTitle(title);
    const ingredients = safeParse(text);
    const recipe = {
      ingredients,
      title,
    };
    dispatch(addRecipe(recipe));
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
      <TextareaAutosize
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => setText(e.target.value)}
        value={text}
      />
      <TextField
        onChange={(e) => setUrl(e.target.value)}
        onBlur={(e) => setUrl(e.target.value)}
        label="Url"
        value={url}
      />
      <TextField
        onChange={(e) => setTitle(e.target.value)}
        onBlur={(e) => setTitle(e.target.value)}
        label="Title"
        value={title}
      />
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
              <TableCell>
                {databaseNumberToString(order.amount.quantity)}
              </TableCell>
              <TableCell>{order.amount.unit}</TableCell>
              <TableCell>{order.ingredient.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={sendToServer}>Save</Button>
      <Button onClick={reset}>Reset</Button>
      <Button onClick={saveToStore}>Store</Button>
      <Button onClick={saveToLocalStorage}>LocalStorage: Save</Button>
      <Button onClick={loadFromLocalStorage}>LocalStorage: Load</Button>
    </Container>
  );
}
