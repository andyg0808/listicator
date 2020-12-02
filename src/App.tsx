import React from "react";
import { useSelector } from "react-redux";

import logo from "./logo.svg";
import "./App.css";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { Draggable, Droppable } from "react-beautiful-dnd";

import { Ingredient, Store, ShoppingOrder, ShoppingList, Order } from "./types";
import { RootState } from "./store";

const listId = "dragId";

function ListEntry({ name, idx }) {
  return (
    <Draggable draggableId={`${name}-${idx}`} index={idx}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          button
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {name}
        </ListItem>
      )}
    </Draggable>
  );
}

function App() {
  const lists = useSelector((store: RootState) => store.lists);
  console.log(lists);
  return (
    <div className="App">
      {lists.map((list) => {
        return (
          <Droppable droppableId={list.store.name}>
            {(provided, snapshot) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {list.items.map((item, idx) => {
                  return <ListEntry name={item.ingredient.name} idx={idx} />;
                })}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        );
      })}
    </div>
  );
}

export default App;
