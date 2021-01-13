import React from "react";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import { Editor } from "./editor";
import { Recipe } from "./types";
import { unparse } from "./parser";

interface RecipeEditorProps {
  recipe: Recipe;
  onSave: (r: Recipe) => void;
  onCancel: () => void;
}

export function RecipeEditor({ recipe, onSave, onCancel }: RecipeEditorProps) {
  const text = unparse(recipe.ingredients);
  const [blob, setBlob] = React.useState({
    text,
    title: recipe.title,
    ingredients: recipe.ingredients,
  });
  return (
    <Paper>
      <Editor
        onUpdate={setBlob}
        defaultText={text}
        defaultTitle={recipe.title}
      />
      <Button onClick={() => onCancel()}>Cancel</Button>
      <Button color="primary" onClick={() => onSave(blob)}>
        Save
      </Button>
    </Paper>
  );
}
