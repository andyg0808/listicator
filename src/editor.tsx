import React from "react";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";

import styled from "@emotion/styled";
import * as R from "ramda";

import { useDispatch } from "react-redux";

import { addRecipe } from "./recipes";
import { safeParse } from "./parser";
import { Order, Recipe, DisplayNumber } from "./types";
import { Prosemirror } from "./Prosemirror";
import { unparse } from "./parser";
import { Viewer } from "./Viewer";

const EditField = styled(Prosemirror)`
  min-height: 50vh;
`;

export interface EditorInterface {
  setTitle: (title: string) => void;
  setIngredients: (ingredients: Array<Order>) => void;
  title: string;
  ingredients: Order[];
}

export function Editor({
  setTitle,
  setIngredients,
  title,
  ingredients,
}: EditorInterface) {
  const [text, setText] = React.useState(unparse(ingredients));

  function textUpdate(text: string): void {
    const parse = safeParse(text);
    if (parse) {
      setIngredients(parse);
    }
  }

  function ingredientUpdate(current: Order, updated: string) {
    const updatedIngredients = ingredients.map((order) => {
      if (current !== order) {
        return order;
      }
      return {
        ...current,
        ingredient: {
          name: updated,
        },
      };
    });
    setText(unparse(updatedIngredients));
    setIngredients(updatedIngredients);
  }

  return (
    <Box display="flex" flexDirection="column">
      <TextField
        data-test="Title"
        onChange={(e: any) => setTitle(e.target.value)}
        onBlur={(e: any) => setTitle(e.target.value)}
        label="Title"
        value={title}
      />
      <EditField onChange={textUpdate} value={text} />
      <Viewer onUpdate={ingredientUpdate} ingredients={ingredients} />
    </Box>
  );
}
