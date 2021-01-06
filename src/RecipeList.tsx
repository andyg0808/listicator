import React from "react";
import { useSelector, useDispatch } from "react-redux";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

import { RootState } from "./store";
import { setMenuSelection } from "./menu_selections";
import { Recipe } from "./types";

export interface RecipeListProps {
  onEdit: (t: Recipe) => void;
  onDelete: (t: Recipe) => void;
}

export default function RecipeList({ onEdit, onDelete }) {
  const dispatch = useDispatch();
  const recipes = useSelector((store: RootState) => store.recipes);
  const checks = useSelector((store: RootState) => store.menuSelections);
  function setCheck(name: string, checked: boolean) {
    dispatch(
      setMenuSelection({
        name,
        include: checked,
      })
    );
  }
  return (
    <List>
      {recipes.map((recipe: Recipe) => {
        const title = recipe.title;
        return (
          <ListItem key={title}>
            <ListItemIcon>
              <Checkbox
                checked={checks[title] || false}
                onChange={(evt) => setCheck(title, evt.target.checked)}
              ></Checkbox>
            </ListItemIcon>
            <ListItemText primary={title}></ListItemText>
            <ListItemSecondaryAction>
              <IconButton onClick={() => onEdit(recipe)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(recipe)} edge="end">
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
}
