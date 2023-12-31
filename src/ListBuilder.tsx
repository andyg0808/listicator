/** @jsxImportSource @emotion/react */
import React from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";

import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";

import * as R from "ramda";

interface ListBuilderProps {
  onChange: (list: string[]) => void;
  items: string[];
}

export function ListBuilder({ onChange, items }: ListBuilderProps) {
  const [editing, setEditing] = React.useState("");
  const addItem = () => {
    setEditing("");
    onChange(R.append(editing, items));
  };
  return (
    <List>
      {items.map((item) => {
        const dropItem = () => onChange(items.filter((i) => i !== item));
        return (
          <ListItem key={item}>
            <ListItemText>{item}</ListItemText>
            <ListItemSecondaryAction>
              <IconButton onClick={dropItem} edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
      <ListItem>
        <ListItemText>
          <form
            onSubmit={(e) => {
              addItem();
              e.preventDefault();
            }}
          >
            <TextField
              data-test="New Store"
              label="New store"
              value={editing}
              onChange={(e: any) => setEditing(e.target.value)}
            />
          </form>
        </ListItemText>
        <ListItemSecondaryAction>
          <Tooltip title="Add store">
            <IconButton edge="end" aria-label="Add store" onClick={addItem}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
}
