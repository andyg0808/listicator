import React from "react";
import { useSelector } from "react-redux";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

import { RootState } from "./store";

export default function RecipeList() {
  const recipes = useSelector((store: RootState) => store.recipes);

  return (
    <List>
      {recipes.map((recipe) => {
        return (
          <ListItem>
            <ListItemIcon>
              <Checkbox></Checkbox>
            </ListItemIcon>
            <ListItemText primary={"Recipe name"}></ListItemText>
          </ListItem>
        );
      })}
    </List>
  );
}
