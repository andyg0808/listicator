/** @jsxImportSource @emotion/react */
import React from "react";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import { Editor } from "./editor";
import { Recipe, DisplayNumber } from "./types";
import { unparse } from "./parser";

interface RecipeEditorProps {
  recipe: Recipe;
  onSave: (r: Recipe) => void;
  onCancel: () => void;
}

export function RecipeEditor({ recipe, onSave, onCancel }: RecipeEditorProps) {
  const [title, setTitle] = React.useState(recipe.title);
  const [ingredients, setIngredients] = React.useState(recipe.ingredients);
  const [error, setError] = React.useState<null | string>(null);
  function onClick() {
    if (title === "") {
      setError("Error: Title required");
      return;
    }
    setError(null);
    onSave({ title, ingredients });
  }
  return (
    <Paper css={{ padding: "0 3vw", minHeight: "100vw" }}>
      <Editor
        setTitle={setTitle}
        setIngredients={setIngredients}
        ingredients={ingredients}
        title={title}
        titleError={error}
      />
      <Button onClick={() => onCancel()}>Cancel</Button>
      <Button color="primary" onClick={onClick}>
        Save
      </Button>
    </Paper>
  );
}
