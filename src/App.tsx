import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";

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
import { RootState, reorder, ReorderEvent } from "./store";

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
        return (
          <Droppable droppableId={list.store.name}>
            {(provided, snapshot) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {list.items.map((item, idx) => {
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

function DragDispatcher({ children }) {
  const dispatch = useDispatch();

  function dragHandler(result, provided) {
    console.log("drag result", result, provided);
    const { source, destination } = result;
    dispatch(
      reorder({
        name: result.draggableId,
        store: destination.droppableId,
        from: source.index,
        to: destination.index,
      })
    );
  }

  return <DragDropContext onDragEnd={dragHandler}>{children}</DragDropContext>;
}

function App() {
  const trip = useSelector((store: RootState) => recipesToTrip(store.recipes));
  console.log(trip);
  return (
    <DragDispatcher>
      <div className="App">
        <h2>List</h2>
        <ListSorter trip={trip} />
      </div>
    </DragDispatcher>
  );
}

export default App;
