/** @jsxImportSource @emotion/react */
import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "@material-ui/core/Button";
import InputBase from "@material-ui/core/InputBase";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import Add from "@material-ui/icons/Add";
import Remove from "@material-ui/icons/Remove";

import { RootState } from "./store";
import { setMenuSelection } from "./menu_selections";
import { setMenuQuantity } from "./menu_quantities";
import { Recipe } from "./types";

export interface RecipeListProps {
  onEdit: (t: Recipe) => void;
  onDelete: (t: Recipe) => void;
}

export default function RecipeList({ onEdit, onDelete }) {
  const dispatch = useDispatch();
  const recipes = useSelector((store: RootState) => store.recipes);
  const checks = useSelector((store: RootState) => store.menuSelections);
  const quantities = useSelector((store: RootState) => store.menuQuantities);
  function setCheck(name: string, checked: boolean) {
    dispatch(
      setMenuSelection({
        name,
        include: checked,
      })
    );
  }
  function setQuantity(name: string, quantity: number) {
    dispatch(
      setMenuQuantity({
        name,
        quantity,
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
              {checks[title] && (
                <TextField
                  type="number"
                  label="Quantity"
                  value={quantities[title] || 1}
                  onChange={(evt) =>
                    setQuantity(title, Number(evt.target.value))
                  }
                />
              )}
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
interface CountScrollProps {
  value: number;
  label: string;
  className?: string;
  onChange: (n: number) => void;
}
function CountScroll({ value, label, className, onChange }: CountScrollProps) {
  return (
    <InputBase
      css={{ width: "2em" }}
      type="number"
      value={value}
      onChange={(evt) => onChange(Number(evt.target.value))}
    />
  );
  return (
    <div css={{}} className={className}>
      <Button onClick={() => onChange(value + 1)}>
        <Add />
      </Button>
      <InputBase
        type="number"
        value={value}
        onChange={(evt) => onChange(Number(evt.target.value))}
      />
      <Button onClick={() => value > 0 && onChange(value - 1)}>
        <Remove />
      </Button>
    </div>
  );
}
