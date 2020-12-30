import React from "react";
import { useSelector, useDispatch } from "react-redux";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

import { RootState } from "./store";
import { setMenuSelection } from "./menu_selections";

export default function RecipeList() {
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
      {recipes.map((recipe) => {
        const title = "title";
        return (
          <ListItem>
            <ListItemIcon>
              <Checkbox
                checked={checks[title]}
                onChange={(evt) => setCheck(title, evt.target.checked)}
              ></Checkbox>
            </ListItemIcon>
            <ListItemText primary={title}></ListItemText>
          </ListItem>
        );
      })}
    </List>
  );
}
