import React from "react";
import Button from "@material-ui/core/Button";
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
    <div>
      <Editor
        onUpdate={setBlob}
        defaultText={text}
        defaultTitle={recipe.title}
      />
      <Button onClick={() => onSave(blob)}>Save</Button>
      <Button onClick={() => onCancel()}>Cancel</Button>
    </div>
  );
}
