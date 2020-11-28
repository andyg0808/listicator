import React from "react";

import logo from "./logo.svg";
import "./App.css";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { Draggable, Droppable } from "react-beautiful-dnd";

type Store = string;
type Ingredient = string;

interface Item {
  name: Ingredient;
  store: Store;
}

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

const items = [
  { name: "sugar", store: "Trader Joe's" },
  { name: "oats", store: "Trader Joe's" },
  { name: "apples", store: "Food 4 Less" },
  { name: "turkey", store: "Albertsons" },
];

function App() {
  return (
    <div className="App">
      <Droppable droppableId={listId}>
        {(provided, snapshot) => (
          <List ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, idx) => {
              return <ListEntry name={item.name} idx={idx} />;
            })}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </div>
  );
}

export default App;
