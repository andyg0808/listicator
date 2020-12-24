import React from "react";
import { useSelector } from "react-redux";

import logo from "./logo.svg";
import "./App.css";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { Draggable, Droppable } from "react-beautiful-dnd";
import { sortBy } from "ramda";

import {
  Ingredient,
  Menu,
  MenuList,
  Order,
  Recipe,
  ShoppingList,
  ShoppingOrder,
  Store,
  TotalOrder,
  Trip,
} from "./types";
import { RootState } from "./store";

import { recipesToTrip } from "./transforms";

import { groupBy } from "ramda";

const listId = "dragId";

function ListEntry({ name, idx }) {
  return (
    <Draggable draggableId={name} index={idx}>
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

function ListSorter({ trip }: { trip: Trip }) {
  const sortOrder = useSelector((store: RootState) => store.shoppingOrder);
  return (
    <React.Fragment>
      {trip.lists.map((list: ShoppingList) => {
        const order = sortOrder[list.store.name] || {};
        let index = 0;
        const sortedItems = sortBy((i) => {
          const i = order[i.ingredient.name] || index;
          index++;
        }, list.items);
        return (
          <Droppable droppableId={list.store.name}>
            {(provided, snapshot) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {sortedItems.map((item, idx) => {
                  return (
                    <ListEntry
                      name={item.ingredient.name}
                      key={item.ingredient.name}
                      idx={idx}
                    />
                  );
                })}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        );
      })}
    </React.Fragment>
  );
}

function App() {
  const trip = useSelector((store: RootState) => recipesToTrip(store.recipes));
  console.log(trip);
  return (
    <div className="App">
      <h2>List</h2>
      <ListSorter trip={trip} />
    </div>
  );
}

export default App;
