/** @jsxImportSource @emotion/react */

import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Fab from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";

import { useSelector, useDispatch } from "react-redux";

import { useSortedTrip } from "./trip";
import { RootState } from "./store";

import { Recipe, Trip } from "./types";
import { setRecipe, updateRecipe } from "./recipes";
import { useDeleteRecipe } from "./undo";
import { DragDispatcher } from "./DragDispatcher";
import RecipeList from "./RecipeList";
import { RecipeEditor } from "./AddRecipe";
import { ListSorter } from "./ListSorter";

interface BuildTabProps {
  startEdit: () => void;
}

export function BuildTab({ startEdit }: BuildTabProps) {
  const sortedTrip = useSortedTrip();
  const stores = useSelector((store: RootState) => store.storeList);

  const dispatch = useDispatch();

  const [editing, startEditing] = React.useState<Recipe | null>(null);
  const closeEditor = () => startEditing(null);
  const saveHandler = (a: Recipe) => {
    if (a) {
      if (editing?.title) {
        dispatch(updateRecipe({ title: editing.title, recipe: a }));
      } else {
        dispatch(setRecipe(a));
      }
    }
    closeEditor();
  };
  const startRecipe = () =>
    startEditing({
      title: "",
      ingredients: [],
    });

  const onDeleteRecipe = useDeleteRecipe();
  return (
    <DragDispatcher trip={sortedTrip}>
      <div>
        <RecipeList onEdit={startEditing} onDelete={onDeleteRecipe} />
        <Drawer anchor="bottom" open={Boolean(editing)} onClose={closeEditor}>
          {editing && (
            <RecipeEditor
              recipe={editing}
              onSave={saveHandler}
              onCancel={closeEditor}
            />
          )}
        </Drawer>
        <Tooltip title="Add Recipe">
          <Fab
            color="primary"
            onClick={startRecipe}
            css={{
              position: "fixed",
              bottom: "15px",
              right: "15px",
              zIndex: 10,
            }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
        <ListSorter
          stores={stores}
          trip={sortedTrip}
          onHeaderClick={startEdit}
        />
      </div>
    </DragDispatcher>
  );
}
